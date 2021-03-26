export default function isSameOrigin(url) {
    const location = window.location;
    const a = document.createElement("a");
    a.href = url;
    return (
        a.protocol == location.protocol &&
        a.hostname == location.hostname &&
        a.port == location.port
    );
}
