const { injectTracking, getGlobalGtmId } = require("../src/utils/tracking-snippet.util");

const shell = '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body class="x"><app-root></app-root></body></html>';

describe("tracking snippet", () => {
  afterEach(() => delete process.env.GTM_ID);

  it("injects GTM once into head and noscript right after body", () => {
    const html = injectTracking(shell, "GTM-ABC123");
    expect(html.match(/googletagmanager\.com\/gtm\.js/g)).toHaveLength(1);
    expect(html.match(/ns\.html\?id=GTM-ABC123/g)).toHaveLength(1);
    expect(html.indexOf("gtm.js")).toBeLessThan(html.indexOf("</head>"));
    expect(html).toMatch(/<body class="x">\s*<!-- Google Tag Manager \(noscript\) -->/);
  });

  it("leaves HTML untouched when no GTM ID is configured", () => {
    expect(injectTracking(shell, null)).toBe(shell);
  });

  it("rejects malformed GTM IDs", () => {
    process.env.GTM_ID = "GTM-ABC');alert(1);//";
    expect(getGlobalGtmId()).toBeNull();
    process.env.GTM_ID = " gtm-abc123 ";
    expect(getGlobalGtmId()).toBe("GTM-ABC123");
  });
});
