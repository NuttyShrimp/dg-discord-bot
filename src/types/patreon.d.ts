declare namespace Patreon {
  type PledeResponse = {
    data: Pledge[];
    included: (Reward|User)[];
    links: Record<string, string>;
    meta: {
      count: number;
    }
  }

  type Reward = {
    attributes: {
      amount: number,
      discord_role_ids: string[];
    },
    id: number,
    type: 'reward'
  }

  type User = {
    attributes: {
      social_connections: {
        discord?: {
          url: null,
          user_id?: string;
        },
      },
    },
    id: number,
    type: 'user'
  }

  type Pledge = {
    attributes: {
      declined_since: string | null,
    },
    id: number,
    relationships: {
      patron: {
        data: {
          id: number,
          type: 'user'
        },
      },
      reward: {
        data: {
          id: number,
          type: 'reward'
        },
      }
    },
    type: 'pledge'
  }

}