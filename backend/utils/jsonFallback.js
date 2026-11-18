const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Use /tmp on serverless environments (like Vercel if no MONGODB_URI is provided) or backend/data locally
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel
  ? path.join('/tmp', 'finance_manager_data')
  : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

let storeCache = null;

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const loadStore = () => {
  if (storeCache) return storeCache;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      storeCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return storeCache;
    } catch (e) {
      console.warn('Corrupted JSON database file, re-initializing...');
    }
  }
  storeCache = {};
  return storeCache;
};

const saveStore = () => {
  try {
    ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(storeCache || {}, null, 2));
  } catch (e) {
    console.warn('Could not persist JSON store:', e.message);
  }
};

const generateObjectId = () => crypto.randomBytes(12).toString('hex');

const getValueByPath = (obj, pathStr) => {
  if (!obj || !pathStr) return undefined;
  return pathStr.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
};

const matchesCondition = (docVal, cond) => {
  if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date)) {
    // Check operators
    if ('$regex' in cond) {
      const flags = cond.$options || '';
      const regex = new RegExp(cond.$regex, flags);
      return regex.test(String(docVal || ''));
    }
    if ('$gte' in cond || '$lte' in cond || '$gt' in cond || '$lt' in cond) {
      const dVal =
        docVal instanceof Date || (typeof docVal === 'string' && !isNaN(Date.parse(docVal)))
          ? new Date(docVal).getTime()
          : Number(docVal);
      if ('$gte' in cond && dVal < new Date(cond.$gte).getTime()) return false;
      if ('$lte' in cond && dVal > new Date(cond.$lte).getTime()) return false;
      if ('$gt' in cond && dVal <= new Date(cond.$gt).getTime()) return false;
      if ('$lt' in cond && dVal >= new Date(cond.$lt).getTime()) return false;
      return true;
    }
    if ('_id' in cond) {
      return String(docVal?._id || docVal) === String(cond._id);
    }
  }

  const left = docVal && typeof docVal === 'object' && '_id' in docVal ? String(docVal._id) : String(docVal ?? '');
  const right = cond && typeof cond === 'object' && '_id' in cond ? String(cond._id) : String(cond ?? '');
  if (docVal === null && cond === null) return true;
  return left === right;
};

const matchesFilter = (doc, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(cond)) {
      const anyMatch = cond.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }
    const docVal = getValueByPath(doc, key);
    if (!matchesCondition(docVal, cond)) {
      return false;
    }
  }
  return true;
};

const evalExpr = (doc, expr) => {
  if (typeof expr === 'string' && expr.startsWith('$')) {
    return getValueByPath(doc, expr.slice(1));
  }
  if (expr && typeof expr === 'object') {
    if ('$year' in expr) {
      const d = new Date(evalExpr(doc, expr.$year));
      return d.getFullYear();
    }
    if ('$month' in expr) {
      const d = new Date(evalExpr(doc, expr.$month));
      return d.getMonth() + 1;
    }
  }
  return expr;
};

/**
 * Installs a lightweight JSON persistence engine onto Mongoose models when MongoDB server is offline.
 */
const enableJsonFallback = (mongoose) => {
  const store = loadStore();

  // Map collection/model names
  const modelMap = {};
  for (const name of mongoose.modelNames()) {
    const m = mongoose.model(name);
    modelMap[name] = m;
    modelMap[m.collection.name] = m;
    if (!store[m.collection.name]) {
      store[m.collection.name] = [];
    }
  }
  saveStore();

  for (const name of mongoose.modelNames()) {
    const Model = mongoose.model(name);
    const colName = Model.collection.name;
    const schema = Model.schema;

    // Determine ref fields from schema for populate()
    const refMap = {};
    schema.eachPath((pathname, schematype) => {
      if (schematype.options && schematype.options.ref) {
        refMap[pathname] = schematype.options.ref;
      }
    });

    const wrapDoc = (raw) => {
      if (!raw) return null;
      const doc = { ...raw };

      // Attach instance methods (like matchPassword on User)
      if (schema.methods) {
        for (const [mName, fn] of Object.entries(schema.methods)) {
          Object.defineProperty(doc, mName, {
            value: fn.bind(doc),
            enumerable: false,
          });
        }
      }

      Object.defineProperty(doc, '_modifiedPaths', {
        value: new Set(),
        enumerable: false,
        writable: true,
      });

      Object.defineProperty(doc, 'isModified', {
        value: function (pathCheck) {
          return this._modifiedPaths.has(pathCheck);
        },
        enumerable: false,
      });

      Object.defineProperty(doc, 'save', {
        value: async function () {
          const existingIdx = store[colName].findIndex((item) => String(item._id) === String(this._id));
          const prev = existingIdx >= 0 ? store[colName][existingIdx] : null;

          if (!prev || prev.password !== this.password) {
            this._modifiedPaths.add('password');
          }

          // Run pre-save hooks for User password hashing if modified
          if (name === 'User' && this.isModified('password') && this.password && !String(this.password).startsWith('$2')) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
          }

          this.updatedAt = new Date();
          if (!this.createdAt) this.createdAt = new Date();

          // Strip populated objects back to IDs for storage
          const toSave = { ...this };
          for (const refKey of Object.keys(refMap)) {
            if (toSave[refKey] && typeof toSave[refKey] === 'object' && '_id' in toSave[refKey]) {
              toSave[refKey] = toSave[refKey]._id;
            }
          }

          if (existingIdx >= 0) {
            store[colName][existingIdx] = toSave;
          } else {
            store[colName].push(toSave);
          }
          saveStore();
          this._modifiedPaths.clear();
          return this;
        },
        enumerable: false,
      });

      Object.defineProperty(doc, 'populate', {
        value: async function (field, selectStr) {
          const refModelName = refMap[field];
          if (!refModelName) return this;
          const RefModel = modelMap[refModelName];
          if (!RefModel) return this;
          const refCol = RefModel.collection.name;
          const targetId = this[field]?._id || this[field];
          if (!targetId) return this;
          const found = (store[refCol] || []).find((x) => String(x._id) === String(targetId));
          if (found) {
            this[field] = { ...found };
          }
          return this;
        },
        enumerable: false,
      });

      return doc;
    };

    class QueryChain {
      constructor(filter = {}, isSingle = false) {
        this.filter = filter;
        this.isSingle = isSingle;
        this.sortSpec = null;
        this.skipVal = 0;
        this.limitVal = null;
        this.populates = [];
        this.selectSpec = null;
      }

      sort(spec) {
        this.sortSpec = spec;
        return this;
      }

      skip(n) {
        this.skipVal = Number(n) || 0;
        return this;
      }

      limit(n) {
        this.limitVal = Number(n);
        return this;
      }

      populate(field, selectStr) {
        this.populates.push({ field, selectStr });
        return this;
      }

      select(spec) {
        this.selectSpec = spec;
        return this;
      }

      async exec() {
        let items = (store[colName] || []).filter((item) => matchesFilter(item, this.filter));

        if (this.sortSpec) {
          const entries = Object.entries(this.sortSpec);
          items.sort((a, b) => {
            for (const [k, dir] of entries) {
              const va = getValueByPath(a, k);
              const vb = getValueByPath(b, k);
              const da = va instanceof Date || (typeof va === 'string' && !isNaN(Date.parse(va)) && k.toLowerCase().includes('date') || k === 'createdAt')
                ? new Date(va).getTime()
                : va;
              const db = vb instanceof Date || (typeof vb === 'string' && !isNaN(Date.parse(vb)) && k.toLowerCase().includes('date') || k === 'createdAt')
                ? new Date(vb).getTime()
                : vb;
              if (da < db) return -1 * dir;
              if (da > db) return 1 * dir;
            }
            return 0;
          });
        }

        if (this.skipVal > 0) {
          items = items.slice(this.skipVal);
        }
        if (this.limitVal !== null && !isNaN(this.limitVal)) {
          items = items.slice(0, this.limitVal);
        }

        const docs = items.map((raw) => {
          const d = wrapDoc(raw);
          for (const pop of this.populates) {
            const refModelName = refMap[pop.field];
            const RefModel = modelMap[refModelName];
            if (RefModel && d[pop.field]) {
              const refCol = RefModel.collection.name;
              const targetId = d[pop.field]?._id || d[pop.field];
              const found = (store[refCol] || []).find((x) => String(x._id) === String(targetId));
              d[pop.field] = found ? { ...found } : null;
            }
          }
          if (this.selectSpec && typeof this.selectSpec === 'string') {
            if (this.selectSpec.startsWith('-')) {
              const excludeField = this.selectSpec.slice(1).trim();
              delete d[excludeField];
            }
          }
          return d;
        });

        if (this.isSingle) {
          return docs[0] || null;
        }
        return docs;
      }

      then(resolve, reject) {
        return this.exec().then(resolve, reject);
      }

      catch(reject) {
        return this.exec().catch(reject);
      }
    }

    // Override static methods on Model
    Model.find = (filter = {}) => new QueryChain(filter, false);
    Model.findOne = (filter = {}) => new QueryChain(filter, true);
    Model.findById = (id) => new QueryChain({ _id: id }, true);

    Model.countDocuments = async (filter = {}) => {
      return (store[colName] || []).filter((item) => matchesFilter(item, filter)).length;
    };

    Model.create = async (data) => {
      if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
          results.push(await Model.create(item));
        }
        return results;
      }

      const raw = { ...data };
      if (!raw._id) raw._id = generateObjectId();

      // Apply schema defaults
      schema.eachPath((pathname, schematype) => {
        if (raw[pathname] === undefined && schematype.options && schematype.options.default !== undefined) {
          const def = schematype.options.default;
          raw[pathname] = typeof def === 'function' ? def() : def;
        }
      });

      raw.createdAt = raw.createdAt || new Date();
      raw.updatedAt = new Date();

      const doc = wrapDoc(raw);
      doc._modifiedPaths.add('password');
      await doc.save();
      return doc;
    };

    Model.insertMany = async (arr) => {
      const results = [];
      for (const item of arr) {
        results.push(await Model.create(item));
      }
      return results;
    };

    Model.deleteOne = async (filter = {}) => {
      const idx = (store[colName] || []).findIndex((item) => matchesFilter(item, filter));
      if (idx >= 0) {
        store[colName].splice(idx, 1);
        saveStore();
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    };

    Model.deleteMany = async (filter = {}) => {
      const before = (store[colName] || []).length;
      store[colName] = (store[colName] || []).filter((item) => !matchesFilter(item, filter));
      const deletedCount = before - store[colName].length;
      saveStore();
      return { deletedCount };
    };

    Model.aggregate = async (pipeline = []) => {
      let current = [...(store[colName] || [])];

      for (const stage of pipeline) {
        if (stage.$match) {
          current = current.filter((doc) => matchesFilter(doc, stage.$match));
        } else if (stage.$group) {
          const idSpec = stage.$group._id;
          const groups = new Map();

          for (const doc of current) {
            let groupKeyObj;
            if (idSpec === null) {
              groupKeyObj = null;
            } else if (typeof idSpec === 'string' && idSpec.startsWith('$')) {
              groupKeyObj = getValueByPath(doc, idSpec.slice(1));
            } else if (typeof idSpec === 'object') {
              groupKeyObj = {};
              for (const [k, expr] of Object.entries(idSpec)) {
                groupKeyObj[k] = evalExpr(doc, expr);
              }
            }
            const mapKey = JSON.stringify(groupKeyObj);
            if (!groups.has(mapKey)) {
              const initGroup = { _id: groupKeyObj };
              for (const [field, accSpec] of Object.entries(stage.$group)) {
                if (field === '_id') continue;
                if ('$sum' in accSpec) initGroup[field] = 0;
              }
              groups.set(mapKey, initGroup);
            }
            const g = groups.get(mapKey);
            for (const [field, accSpec] of Object.entries(stage.$group)) {
              if (field === '_id') continue;
              if ('$sum' in accSpec) {
                const sumTarget = accSpec.$sum;
                if (typeof sumTarget === 'number') {
                  g[field] += sumTarget;
                } else if (typeof sumTarget === 'string' && sumTarget.startsWith('$')) {
                  g[field] += Number(getValueByPath(doc, sumTarget.slice(1)) || 0);
                }
              }
            }
          }
          current = Array.from(groups.values());
        } else if (stage.$lookup) {
          const { from, localField, foreignField, as } = stage.$lookup;
          const foreignDocs = store[from] || [];
          current = current.map((doc) => {
            const localVal = getValueByPath(doc, localField);
            const matched = foreignDocs.filter(
              (f) => String(getValueByPath(f, foreignField)) === String(localVal)
            );
            return { ...doc, [as]: matched };
          });
        } else if (stage.$unwind) {
          const pathName = typeof stage.$unwind === 'string' ? stage.$unwind.slice(1) : stage.$unwind.path.slice(1);
          const unwound = [];
          for (const doc of current) {
            const arr = doc[pathName];
            if (Array.isArray(arr)) {
              for (const el of arr) {
                unwound.push({ ...doc, [pathName]: el });
              }
            }
          }
          current = unwound;
        } else if (stage.$project) {
          current = current.map((doc) => {
            const projected = { _id: doc._id };
            for (const [k, v] of Object.entries(stage.$project)) {
              if (v === 1) {
                projected[k] = doc[k];
              } else if (typeof v === 'string' && v.startsWith('$')) {
                projected[k] = getValueByPath(doc, v.slice(1));
              }
            }
            return projected;
          });
        } else if (stage.$sort) {
          const entries = Object.entries(stage.$sort);
          current.sort((a, b) => {
            for (const [k, dir] of entries) {
              const va = getValueByPath(a, k);
              const vb = getValueByPath(b, k);
              if (va < vb) return -1 * dir;
              if (va > vb) return 1 * dir;
            }
            return 0;
          });
        }
      }

      return current;
    };
  }

  console.log(`JSON Persistent Database Fallback initialized at: ${DB_FILE}`);
};

module.exports = { enableJsonFallback };
