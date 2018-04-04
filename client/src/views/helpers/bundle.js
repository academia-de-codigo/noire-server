module.exports = function(context) {
    return `<script src="/js/${context.root.view}.bundle.js" charset="utf-8"></script>`;
};
