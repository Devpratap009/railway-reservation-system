import AddTrainForm from "../components/AddTrainForm";

export default function AdminPage() {
  return (
    <section className="page narrow">
      <h1>Manage Trains</h1>
      <p className="subtitle">Add a new train with its route and seat capacity.</p>
      <AddTrainForm />
    </section>
  );
}