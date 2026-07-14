import { prisma } from "@/lib/prisma";

interface Node {
  id: string;
  name: string;
  positionName: string | null;
  children: Node[];
}

export default async function OrgChartPage() {
  const employees = await prisma.employee.findMany({
    include: { position: true },
    orderBy: { name: "asc" },
  });

  const byId = new Map<string, Node>();
  for (const e of employees) {
    byId.set(e.id, { id: e.id, name: e.name, positionName: e.position?.name ?? null, children: [] });
  }
  const roots: Node[] = [];
  for (const e of employees) {
    const node = byId.get(e.id)!;
    if (e.managerId && byId.has(e.managerId)) {
      byId.get(e.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Org Chart</h1>
      <div className="card">
        <ul className="space-y-1">
          {roots.map((r) => (
            <TreeNode key={r.id} node={r} depth={0} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function TreeNode({ node, depth }: { node: Node; depth: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
        style={{ marginLeft: depth * 24 }}
      >
        <span className="font-medium text-slate-900">{node.name}</span>
        {node.positionName && <span className="text-xs text-slate-500">— {node.positionName}</span>}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
