import { Header } from "@/components/header";
import ImageUploadForm from "@/components/image-upload-form";
import JobsList from "@/components/jobs-list";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ImageUploadForm />
          </div>

          <div className="lg:col-span-2">
            <JobsList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
