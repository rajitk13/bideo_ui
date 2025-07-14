import ViewVideo from '@/components/ViewVideo';

export default function Page({ params }: { params: { id: any } }) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <ViewVideo id={params.id} />
    </div>
  );
}
