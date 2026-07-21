-- DentMatch — durcissement sécurité (suite aux advisors Supabase)

-- search_path immuable sur la fonction de trigger updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Les fonctions de trigger ne doivent jamais être appelables via l'API REST.
revoke execute on function public.set_updated_at() from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.notify_new_application() from anon, authenticated, public;
revoke execute on function public.notify_application_status_change() from anon, authenticated, public;
revoke execute on function public.notify_new_message() from anon, authenticated, public;
revoke execute on function public.notify_document_review() from anon, authenticated, public;

-- Les fonctions métier et helpers RLS sont réservées aux utilisateurs connectés.
revoke execute on function public.accept_application(uuid, boolean) from anon, public;
revoke execute on function public.get_or_create_application_conversation(uuid) from anon, public;
revoke execute on function public.delete_own_account() from anon, public;
revoke execute on function public.log_audit_event(text, text, uuid, jsonb) from anon, public;
revoke execute on function public.is_admin() from anon, public;
revoke execute on function public.current_cabinet_id() from anon, public;
revoke execute on function public.is_conversation_member(uuid) from anon, public;
revoke execute on function public.shares_application_with(uuid) from anon, public;
revoke execute on function public.shares_conversation_with(uuid) from anon, public;

-- Note : la vue public_candidate_profiles reste volontairement SECURITY DEFINER :
-- elle n'expose que des champs publics choisis (jamais d'identifiants sensibles)
-- et n'est accessible qu'au rôle authenticated (revoke anon fait en 0002).
