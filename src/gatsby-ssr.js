import React from 'react';

const getOptions = (pluginOptions) => {
  const plausibleDomain = pluginOptions.customDomain || 'plausible.io';
  const scriptUri = pluginOptions.scriptUri || '/js/plausible.js';
  const domain = pluginOptions.domain;
  const excludePaths = pluginOptions.excludePaths || [];
  const trackAcquisition = pluginOptions.trackAcquisition || false;

  return {
    plausibleDomain,
    scriptUri,
    domain,
    excludePaths,
    trackAcquisition,
  };
};

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const { plausibleDomain, scriptUri, domain, excludePaths, trackAcquisition } =
    getOptions(pluginOptions);

  const plausibleExcludePaths = [];
  const Minimatch = require(`minimatch`).Minimatch;
  excludePaths.map((exclude) => {
    const mm = new Minimatch(exclude);
    plausibleExcludePaths.push(mm.makeRe());
  });
  const scriptProps = {
    defer: true,
    'data-domain': domain,
    src: `https://${plausibleDomain}${scriptUri}`,
  };
  if (trackAcquisition) {
    scriptProps['data-track-acquisition'] = true;
  }

  return setHeadComponents([
    <link
      key="gatsby-plugin-plausible-preconnect"
      rel="preconnect"
      href={`https://${plausibleDomain}`}
    />,
    <script key="gatsby-plugin-plausible-script" {...scriptProps} />,
    <script
      key="gatsby-plugin-plausible-custom-events"
      dangerouslySetInnerHTML={{
        __html: `
          window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
          ${
            excludePaths.length
              ? `window.plausibleExcludePaths=[${excludePaths.join(`,`)}];`
              : ``
          }
          `,
      }}
    />,
  ]);
};
