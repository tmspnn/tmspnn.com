export default function comment(namespace, element, data) {
    const v = new View(namespace, element, data);
    v._name = `comment(${v._data.id})`;

    const { _refs, _data } = v;

    _refs.advocateBtn.on("click", () => {
        v.dispatch("advocateComment", _data.id, _data.advocated);
    });

    _refs.reportAbuseBtn.on("click", () => {
        v.ui("reportAbusePanel::show", _data);
    });

    v.onAdvocation = (n) => {
        _data.advocators_count += n;
        _refs.advocatorsCountSpan.textContent = _data.advocators_count;
        if (n > 0) {
            addClass(_refs.advocateBtn, "active");
        } else {
            removeClass(_refs.advocateBtn, "active");
        }
    };

    return v;
}
