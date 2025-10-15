import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";

const Page = async () => {
  const user = await db.user.findFirst();
  return (
    <div className="min-h-screen flex  items-center justify-center">
      <Button className="mb-4">Click Me</Button>
      {JSON.stringify(user)}
    </div>
  );
};

export default Page;
