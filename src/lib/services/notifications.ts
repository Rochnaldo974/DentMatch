/**
 * Abstraction du service d'emails transactionnels.
 *
 * Le MVP n'envoie pas d'emails : les notifications passent par la table
 * `notifications` (temps réel dans l'application). Cette interface permet de
 * brancher plus tard Resend ou un autre fournisseur sans toucher au reste du
 * code — il suffit d'implémenter EmailProvider et de remplacer l'instance.
 */

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailProvider {
  send(email: TransactionalEmail): Promise<{ ok: boolean; error?: string }>;
}

/** Implémentation locale : journalise sans envoyer (mode démonstration). */
class NoopEmailProvider implements EmailProvider {
  async send(email: TransactionalEmail) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[email simulé] à ${email.to} — ${email.subject}`);
    }
    return { ok: true };
  }
}

// Pour brancher Resend plus tard :
// class ResendEmailProvider implements EmailProvider { ... }

export const emailProvider: EmailProvider = new NoopEmailProvider();
