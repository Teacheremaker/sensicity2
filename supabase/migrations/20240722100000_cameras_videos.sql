-- Caméras
create table public.cameras (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  ip          inet unique,
  modele      text,
  zone        text,
  est_active  boolean default true,
  ajoute_le   timestamptz default now(),
  ajoute_par  uuid references auth.users(id)
);

-- Vidéos liées à la main courante
create table public.videos (
  id            uuid primary key default gen_random_uuid(),
  camera_id     uuid references cameras(id) on delete cascade,
  main_courante_id uuid references main_courante(id) on delete set null,
  fichier_url   text,
  debut         timestamptz,
  fin           timestamptz,
  cree_le       timestamptz default now()
);

-- RLS
alter table cameras enable row level security;
alter table videos   enable row level security;

create policy "Lecture caméras" on cameras for select using (true);
create policy "Écriture caméras" on cameras for all
  using (auth.uid() is not null);

create policy "Lecture vidéos" on videos for select using (true);
create policy "Écriture vidéos" on videos for all
  using (auth.uid() is not null);
