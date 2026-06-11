import AdminModeration from "../AdminModeration";

function Admin({ token }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-primary-800 mb-2">
        Espace administrateur
      </h1>
      <p className="text-gray-500 mb-8">
        Modération des évènements soumis par les organisateurs.
      </p>
      <AdminModeration token={token} />
    </div>
  );
}

export default Admin;
