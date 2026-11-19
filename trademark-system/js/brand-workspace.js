const BrandWorkspace = (() => {
  const W = CaseWorkspace;
  const sections = [
    ['brand.html', '品牌管理'],
    ['brand-map.html', '品牌图谱'],
    ['brand-auth-external.html', '授权外部使用'],
    ['brand-auth-internal.html', '授权内部使用']
  ];

  function navigation(active, brand) {
    return `<nav class="wb-steps wb-brand-nav" aria-label="品牌工作区">${sections.map(([href,label]) =>
      `<a href="${W.e(W.url(href, { brand }))}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  }

  return { navigation };
})();
