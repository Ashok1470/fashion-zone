import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://lqttwobzqpjmvftafwlj.supabase.co";

const supabaseKey =
  "sb_publishable_4cKGYcmuSFFS22V93xJboQ_dPXdJVin";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);