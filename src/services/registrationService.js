import { registerTeam as saveTeam } from './teamService';

export async function registerTeam(data) {
  return saveTeam(data);
}
