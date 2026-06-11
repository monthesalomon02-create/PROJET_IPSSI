import CreerEvenement from "../CreerEvenement";
import MesEvenements from "../MesEvenements";

function Organisateur({ token }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-primary-800 mb-8">
        Mon espace organisateur
      </h1>
      <CreerEvenement token={token} />
      <MesEvenements token={token} />
    </div>
  );
}

export default Organisateur;
