
export function addTab(html, tabData:TabData){
  if((game as ReadyGame).version.startsWith('13')){
    addTabV13(html, tabData)
    addTabContentV13(html, tabData)
  }
}

export function addTabContent(html, tabData:TabData){
  if((game as ReadyGame).version.startsWith('13')){
    addTabV13(html, tabData)
  }
}

function addTabV13(html, tabData:TabData){
  if( html.find(`nav.${tabData.group}-tabs a[data-tab="${tabData.id}"]`).length === 0) {
    const tab = $(`<a data-action="tab" data-group="${tabData.group}" data-tab="${tabData.id}">${tabData.icon} ${tabData.name}</a>`);
    html.find(`nav.${tabData.group}-tabs`).append(tab);
    tab.on('click',tabData.onClick)
  }
}

function addTabContentV13(html, tabData:TabData){
  if( html.find(`section.tab[data-tab="${tabData.id}"]`).length === 0) {
    html.find(`nav.${tabData.group}-tabs`).after(`
    <section class="tab" data-application-part="${tabData.id}" data-group="${tabData.group}" data-tab="${tabData.id}">
      ${tabData.content}
    </section>`);
  }
}
