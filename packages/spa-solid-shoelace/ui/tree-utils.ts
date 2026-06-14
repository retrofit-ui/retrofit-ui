export interface TreeNode {
  node: Record<string, unknown>;
  children: TreeNode[];
}

export function buildTree(
  nodes: Record<string, unknown>[],
  idField: string,
  parentField: string,
): TreeNode[] {
  const byId = new Map<unknown, TreeNode>();
  for (const node of nodes) {
    byId.set(node[idField], { node, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const treeNode of byId.values()) {
    const parentId = treeNode.node[parentField];
    if (parentId == null || !byId.has(parentId)) {
      roots.push(treeNode);
    } else {
      byId.get(parentId)?.children.push(treeNode);
    }
  }

  return roots;
}
