const Regex = {
    isCampaign: /\b^(\d){5,6}(_|-).*\b/,
    isHtml5: /\b^HTML5$\b/i,
    isLanguage: /\b^([A-Z]){3,4}$\b/,
    isSize: /\b^\d{2,4}x\d{2,4}\b/i,
    isFile: /\b.*.html$\b/i,
    isOther: /\b^_.*\b$/
}
export default Regex;