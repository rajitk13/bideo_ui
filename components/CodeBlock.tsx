function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
  );
}

export default CodeBlock;
