// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				OPENAI_API_KEY: string;
				MINIMAX_API_KEY: string;
				SUPABASE_URL: string;
				SUPABASE_ANON_KEY: string;
				SUPABASE_SERVICE_KEY: string;
			};
		}
	}
}

export {};
