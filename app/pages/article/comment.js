export default function comment(namespace, element, data) {
    const v = new View(namespace, element, data);

    v._refs.advocateBtn.on("click", () => {
        v.dispatch("advocateComment", v._data.id, v._data.advocated);
    });

    v._refs.reportAbuseBtn.on("click", () => {
        v.ui("reportAbusePanel::show", v._data);
    });

    v.onAdvocation = (n) => {
        v._data.advocators_count += n;
        v._refs.advocatorsCountSpan = v._data.advocators_count;
    };

    return v;
}
