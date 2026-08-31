(() => {
  window.DndCharacterSheetComponents = (() => {
    function AbilityGlyph({
      ability
    }) {
      const paths = {
        fue: 'M3 10h18M6 7v6m12-6v6M3 8v4m18-4v4',
        des: 'M20 4c-5 1-9 5-10 10l-1 6 6-1c5-1 9-5 10-10l-5 1Z M8 16l4-4m0 8 4-4',
        con: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z',
        int: 'M5 4.5A3.5 3.5 0 0 1 8.5 2H19v17H8.5A3.5 3.5 0 0 0 5 22ZM5 4.5V22m4-14h6m-6 4h6',
        sab: 'M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Zm9 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
        car: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z'
      };
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: paths[ability] || paths.int
      }));
    }
    function CombatSectionIcon({
      section
    }) {
      const paths = {
        summary: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z M9 12l2 2 4-4',
        conditions: 'M9 5h.01M15 5h.01M8 13c1.1 1 2.4 1.5 4 1.5s2.9-.5 4-1.5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
        timers: 'M9 2h6M12 14l3-3m-3 10a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
        resources: 'M9 3h6M10 3v5l-4 8a3 3 0 0 0 2.7 4h6.6a3 3 0 0 0 2.7-4l-4-8V3M8 15h8',
        arsenal: 'm14 5 5 5M4 20l7-7m2-6 2-2 4 4-2 2m-8 2-4 4'
      };
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: paths[section] || paths.summary
      }));
    }
    function CharacterSectionGlyph({
      section
    }) {
      const paths = {
        attributes: 'M12 3 5 7v5c0 4.2 2.7 7.5 7 9 4.3-1.5 7-4.8 7-9V7l-7-4Zm-3 8h6m-3-3v6',
        saves: 'M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
        skills: 'm12 3 1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3Zm0 14v2m-5-4 1.5 1.5m8.5-1.5-1.5 1.5',
        traits: 'M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 14 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z',
        feats: 'M12 3 14.8 8l5.2 1-3.6 3.8.7 5.2-5.1-2.3L6.9 18l.7-5.2L4 9l5.2-1L12 3Z'
      };
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: paths[section] || paths.attributes
      }));
    }
    function InventoryGlyph({
      section
    }) {
      const paths = {
        equipment: 'M7 21h10M8 21V9l4-5 4 5v12M9 12h6M9 16h6',
        backpack: 'M7 8h10a3 3 0 0 1 3 3v8H4v-8a3 3 0 0 1 3-3Zm2 0V6a3 3 0 0 1 6 0v2m-7 5h8',
        coins: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm8 3v5c0 1.7-3.6 3-8 3s-8-1.3-8-3V7m16 5v5c0 1.7-3.6 3-8 3s-8-1.3-8-3v-5',
        journal: 'M6 4h11v16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6m-6 4h6m-6 4h4',
        treasure: 'M5 8h14v11H5V8Zm2-4h10l2 4H5l2-4Zm5 7v5m-2.5-2.5h5'
      };
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("path", {
        d: paths[section] || paths.backpack
      }));
    }
    const DND_CURRENCIES = [{
      key: 'pc',
      label: 'Cobre',
      short: 'PC',
      symbol: '●',
      copperValue: 1
    }, {
      key: 'plata',
      label: 'Plata',
      short: 'PP',
      symbol: '◆',
      copperValue: 10
    }, {
      key: 'electro',
      label: 'Electrum',
      short: 'PE',
      symbol: '◇',
      copperValue: 50
    }, {
      key: 'po',
      label: 'Oro',
      short: 'PO',
      symbol: '✦',
      copperValue: 100
    }, {
      key: 'platino',
      label: 'Platino',
      short: 'PPL',
      symbol: '✧',
      copperValue: 1000
    }];
    const getCurrencyCopperValue = currency => DND_CURRENCIES.reduce((total, coin) => total + Math.max(0, Number(currency?.[coin.key]) || 0) * coin.copperValue, 0);
    const formatCurrencyEquivalent = currency => {
      let remaining = getCurrencyCopperValue(currency);
      const parts = [];
      [...DND_CURRENCIES].reverse().forEach(coin => {
        const quantity = Math.floor(remaining / coin.copperValue);
        if (quantity) parts.push(`${quantity} ${coin.short}`);
        remaining %= coin.copperValue;
      });
      return parts.length ? parts.join(' · ') : '0 PC';
    };
    return {
      AbilityGlyph,
      CombatSectionIcon,
      CharacterSectionGlyph,
      InventoryGlyph,
      DND_CURRENCIES,
      getCurrencyCopperValue,
      formatCurrencyEquivalent
    };
  })();
})();