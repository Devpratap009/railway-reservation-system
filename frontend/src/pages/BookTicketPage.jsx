import { useSearchParams } from "react-router-dom";
import BookTicketForm from "../components/BookTicketForm";

export default function BookTicketPage() {
  const [searchParams] = useSearchParams();
  const initialTrainId = searchParams.get("trainId") || "";

  return (
    <section className="page narrow">
      <h1>Book a Ticket</h1>
      <p className="subtitle">Reserve seats on an available train.</p>
      <BookTicketForm initialTrainId={initialTrainId} />
    </section>
  );
}