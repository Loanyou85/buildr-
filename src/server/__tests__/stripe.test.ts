import { afterEach, describe, expect, it } from 'vitest';
import { planForPriceId, priceIdFor, stripeEnabled, stripeMode } from '../stripe';

const KEYS = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_PRO', 'STRIPE_PRICE_ILLIMITE'] as const;

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe('configuration Stripe', () => {
  it('se considère éteint tant qu’aucune clé n’est renseignée', () => {
    expect(stripeEnabled()).toBe(false);
  });

  it('ignore une clé définie mais vide', () => {
    process.env.STRIPE_SECRET_KEY = '';
    expect(stripeEnabled()).toBe(false);
  });

  it('associe chaque offre à son tarif', () => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_123';
    process.env.STRIPE_PRICE_ILLIMITE = 'price_illimite_456';
    expect(priceIdFor('pro')).toBe('price_pro_123');
    expect(priceIdFor('illimite')).toBe('price_illimite_456');
    // L'offre gratuite n'a pas de tarif : elle ne passe jamais par Stripe.
    expect(priceIdFor('free')).toBeNull();
  });

  it('ne retourne pas de tarif vide, ce qui créerait une session invalide', () => {
    process.env.STRIPE_PRICE_PRO = '   ';
    expect(priceIdFor('pro')).toBeNull();
  });

  it('retrouve l’offre depuis le tarif, au retour du webhook', () => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_123';
    process.env.STRIPE_PRICE_ILLIMITE = 'price_illimite_456';
    expect(planForPriceId('price_pro_123')).toBe('pro');
    expect(planForPriceId('price_illimite_456')).toBe('illimite');
  });

  it('refuse un tarif inconnu plutôt que d’accorder un accès au hasard', () => {
    process.env.STRIPE_PRICE_PRO = 'price_pro_123';
    expect(planForPriceId('price_inconnu')).toBeNull();
    expect(planForPriceId(null)).toBeNull();
    expect(planForPriceId(undefined)).toBeNull();
  });
});

describe('mode réellement actif', () => {
  it('se déduit du préfixe de la clé, pas de l’interrupteur du tableau de bord', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_51AbCdEf';
    expect(stripeMode()).toBe('test');

    process.env.STRIPE_SECRET_KEY = 'sk_live_51AbCdEf';
    expect(stripeMode()).toBe('production');
  });

  it('reconnaît aussi une clé restreinte de test', () => {
    process.env.STRIPE_SECRET_KEY = 'rk_test_51AbCdEf';
    expect(stripeMode()).toBe('test');
  });

  it('signale l’absence de clé plutôt que de supposer la production', () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(stripeMode()).toBe('absent');
    process.env.STRIPE_SECRET_KEY = '  ';
    expect(stripeMode()).toBe('absent');
  });
});
