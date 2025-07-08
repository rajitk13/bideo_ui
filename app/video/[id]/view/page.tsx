import ViewVideo from '@/components/ViewVideo';

export default function Page({ params }: { params: { id: any } }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-3xl">
        <ViewVideo id={params.id} />
      </div>
    </div>
  );
}
