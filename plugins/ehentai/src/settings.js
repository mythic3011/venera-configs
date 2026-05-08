function createSettings(source) {
  return Object.freeze({
    domain: {
      title: "domain",
      type: "select",
      options: [
        {
          value: "e-hentai.org",
        },
        {
          value: "exhentai.org",
        },
      ],
      default: "e-hentai.org",
    },
    ehevent: {
      title: "ehevent",
      type: "switch",
      default: false,
    },
    hvevent: {
      title: "hvevent",
      type: "switch",
      default: false,
    },
    account_switch: {
      title: "accountSwitch",
      type: "callback",
      buttonText: "accountSwitchButton",
      callback: async () => {
        let store = source.loadAccountStore();
        if (!store.profiles.length) {
          UI.showMessage(source.translate("noSavedAccounts"));
          return;
        }
        let options = store.profiles.map((profile, index) => {
          let name = source.getAccountDisplayName(profile, index);
          if (store.activeProfileId === profile.id) {
            return `${name} *`;
          }
          return name;
        });
        let initialIndex = store.profiles.findIndex((profile) => {
          return profile.id === store.activeProfileId;
        });
        if (initialIndex < 0) {
          initialIndex = 0;
        }
        let selectedIndex = await UI.showSelectDialog(
          source.translate("accountSwitch"),
          options,
          initialIndex,
        );
        if (
          selectedIndex == null ||
          selectedIndex < 0 ||
          selectedIndex >= store.profiles.length
        ) {
          return;
        }
        let selected = store.profiles[selectedIndex];
        await source.activateAccountProfile(selected.id);
        UI.showMessage(source.translate("accountSwitched"));
      },
    },
  });
}
