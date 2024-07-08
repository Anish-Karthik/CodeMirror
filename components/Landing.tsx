import { Contests } from './Contests';
import { Hero } from './Hero';
import { Problems } from './Problems';

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />
        <Contests />
        <section className="bg-white py-8 dark:bg-gray-900 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <Problems />
          </div>
        </section>
      </main>
    </div>
  );
}
