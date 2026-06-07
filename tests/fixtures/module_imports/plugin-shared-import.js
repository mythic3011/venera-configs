import { fixtureFormat as fmt } from "shared/test_helpers/build_pipeline_import_helper.js";

class BadSharedImportFixture extends ComicSource {
  constructor() {
    super();
    this.sample = fmt("bad");
  }
}
