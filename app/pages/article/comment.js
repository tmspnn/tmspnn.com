export default function comment(namespace, element, data) {
    const view = new View(namespace, element, data);

    view._refs.advocateBtn.on("click", () => {
        view.dispatch("advocateComment", view._data.id);
    });

    view._refs.replyBtn.on("click", () => {
        location.href = `/comment-editor?refer_to=${view._data.id}`;
    });

    view._refs.reportAbuseBtn.on("click", () => {
        view.ui("reportAbusePanel::show", view._data);
    });

    view.onAdvocation = (num) => {
        view._data.advocators_count += num;
        view._refs.advocatorsCountSpan = view._data.advocators_count;
    };

    return view;
}
