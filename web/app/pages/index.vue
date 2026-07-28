<template>
  <PageContainer>
    <div
      class="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
    >
      <!-- Thesis -->
      <div class="animate-ticket-in">
        <p class="eyebrow mb-6 flex items-center gap-3">
          <span class="inline-block h-px w-8 bg-brass"></span>
          A ledger for your groceries
        </p>
        <h1
          class="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-cloud sm:text-6xl lg:text-7xl"
        >
          Every list,<br />
          kept <span class="text-brass">sharp.</span>
        </h1>
        <p class="mt-7 max-w-md text-lg leading-relaxed text-mist">
          Write it down, check it off, share it with the house. GrocerMe keeps
          the weekly shop on one clean ticket — no clutter, no lost scraps of
          paper.
        </p>
        <div class="mt-9 flex flex-wrap items-center gap-4">
          <NuxtLink to="/signup" class="btn-gold no-underline">
            Start a list
            <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          </NuxtLink>
          <NuxtLink to="/signin" class="btn-ghost no-underline">
            Sign in
          </NuxtLink>
        </div>
        <dl class="mt-12 flex gap-10 border-t border-white/10 pt-6">
          <div>
            <dt class="eyebrow-mist">Shared</dt>
            <dd class="mt-1 font-display text-2xl font-bold text-cloud">
              One tap
            </dd>
          </div>
          <div>
            <dt class="eyebrow-mist">Offline</dt>
            <dd class="mt-1 font-display text-2xl font-bold text-cloud">
              Installs as an app
            </dd>
          </div>
          <div>
            <dt class="eyebrow-mist">Done</dt>
            <dd class="mt-1 font-display text-2xl font-bold text-cloud">
              With confetti
            </dd>
          </div>
        </dl>
      </div>

      <!-- Signature: a live ledger ticket -->
      <div class="animate-ticket-in [animation-delay:120ms]">
        <div class="ticket ticket-ruled mx-auto max-w-sm p-6 pt-7 sm:p-7 sm:pt-8">
          <div class="flex items-baseline justify-between">
            <p class="eyebrow">No. 0417</p>
            <p class="font-mono text-xs text-mist">SAT · WEEKLY</p>
          </div>
          <h2
            class="mt-2 font-display text-3xl font-bold tracking-tight text-cloud"
          >
            Saturday Market
          </h2>
          <div class="perforation my-5"></div>
          <ul class="space-y-3.5 font-mono text-sm">
            <li
              v-for="row in demoRows"
              :key="row.name"
              class="flex items-center justify-between"
            >
              <span
                class="flex items-center gap-3"
                :class="row.done ? 'text-mist line-through' : 'text-cloud'"
              >
                <Icon
                  :name="row.done ? 'heroicons:check-circle-solid' : 'heroicons:stop'"
                  class="h-5 w-5 shrink-0"
                  :class="row.done ? 'text-citron' : 'text-navy-500'"
                />
                {{ row.name }}
              </span>
              <span class="chip" :class="row.done ? '' : 'chip-brass'">
                ×{{ row.qty }}
              </span>
            </li>
          </ul>
          <div class="perforation my-5"></div>
          <div class="flex items-center justify-between font-mono text-xs">
            <span class="text-mist">4 of 6 gathered</span>
            <span class="text-brass">— — — — — — —</span>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
const { checkAuth } = useAuth();

// Sample ticket rows for the hero — a taste of the real thing.
const demoRows = [
  { name: "Sourdough loaf", qty: 1, done: true },
  { name: "Blood oranges", qty: 6, done: true },
  { name: "Cold brew", qty: 2, done: true },
  { name: "Marcona almonds", qty: 1, done: true },
  { name: "Fresh basil", qty: 1, done: false },
  { name: "Manchego", qty: 1, done: false },
];

// Set page title and meta tags
useHead({
  title: "GrocerMe | Home",
  meta: [
    {
      name: "description",
      content:
        "Your personal grocery management solution. Organize your shopping lists and never forget an item again.",
    },
    {
      property: "og:title",
      content: "GrocerMe | Home",
    },
    {
      property: "og:description",
      content:
        "Your personal grocery management solution. Organize your shopping lists and never forget an item again.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
});

// Check authentication on page load
await checkAuth();
</script>
