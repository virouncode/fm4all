const page = async ({ params }: { params: Promise<{ service: string }> }) => {
  const { service } = await params;
  return <div>Page des produits du service {service}</div>;
};

export default page;
