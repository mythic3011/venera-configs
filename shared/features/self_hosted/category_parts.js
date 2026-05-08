function createStaticCategoryPart(partName, label, category, param) {
  return {
    name: partName,
    type: "dynamic",
    loader: function () {
      return [
        {
          label,
          target: {
            page: "category",
            attributes: {
              category,
              param: param == null ? null : param,
            },
          },
        },
      ];
    },
  };
}

function createStoredCategoryPart(options) {
  const opts =
    options && typeof options === "object" && !Array.isArray(options)
      ? options
      : {};
  const partName = String(opts.partName || "");
  const storageKey = String(opts.storageKey || "");
  const getLabel = typeof opts.getLabel === "function" ? opts.getLabel : null;
  const getCategory =
    typeof opts.getCategory === "function" ? opts.getCategory : null;
  const getParam = typeof opts.getParam === "function" ? opts.getParam : null;
  const usePageJumpTarget = opts.usePageJumpTarget === true;
  const getSource = typeof opts.getSource === "function" ? opts.getSource : null;

  if (!partName || !storageKey || !getLabel || !getCategory || !getParam) {
    throw new Error("Invalid createStoredCategoryPart options");
  }

  return {
    name: partName,
    type: "dynamic",
    loader: function () {
      const source = getSource ? getSource() : this;
      const items = source && typeof source.loadData === "function"
        ? source.loadData(storageKey)
        : null;
      if (!Array.isArray(items) || !items.length) {
        return [];
      }
      const result = [];
      for (const item of items) {
        const label = getLabel(item);
        const category = getCategory(item);
        const param = getParam(item);
        if (!label || !category) {
          continue;
        }
        const attributes = { category, param: param == null ? null : param };
        let target;
        if (usePageJumpTarget && typeof PageJumpTarget === "function") {
          target = new PageJumpTarget({ page: "category", attributes });
        } else {
          target = { page: "category", attributes };
        }
        result.push({ label, target });
      }
      return result;
    },
  };
}

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    createStaticCategoryPart,
    createStoredCategoryPart,
  };
}
