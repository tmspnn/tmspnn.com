export default function clearNode(node: Node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
