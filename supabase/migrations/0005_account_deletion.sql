-- DentMatch — suppression de compte par l'utilisateur (RGPD)
-- Fonction security definer : supprime l'utilisateur auth, ce qui cascade sur
-- toutes les tables applicatives (foreign keys on delete cascade).

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'NON_AUTHENTIFIE';
  end if;

  insert into public.audit_events (actor_user_id, event_type, entity_type, entity_id, metadata)
  values (null, 'account_deleted', 'profile', v_user_id, '{}'::jsonb);

  delete from auth.users where id = v_user_id;
end;
$$;
