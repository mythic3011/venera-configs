function fixtureFormat(value) {
  return `shared:${String(value)}`;
}

function createFakeDocumentClasses() {
  return {
    HtmlDocument: class {},
    Cookie: class {
      constructor(value) {
        Object.assign(this, value);
      }
    },
    Comic: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    ComicDetails: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    Comment: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    CategoryComicsData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    HomePageData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    SearchPageData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
    FavoriteData: class {
      constructor(value) {
        Object.assign(this, value || {});
      }
    },
  };
}

export { fixtureFormat, createFakeDocumentClasses };

if (typeof module !== "undefined" && module && module.exports) {
  module.exports = {
    fixtureFormat,
    createFakeDocumentClasses,
  };
}
