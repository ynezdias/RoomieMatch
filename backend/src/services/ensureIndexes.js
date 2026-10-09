const pending = new Map();

// Index creation must run after the database is connected when query buffering is off.
module.exports = async function ensureIndexes(model) {
  if (!pending.has(model.modelName)) {
    pending.set(model.modelName, model.createIndexes().catch(error => {
      pending.delete(model.modelName);
      throw error;
    }));
  }
  await pending.get(model.modelName);
};
