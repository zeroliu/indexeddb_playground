import {BaseAbuser} from './base_abuser';

let abusers: Record<string, BaseAbuser> = {};

export function getAbuser(name: string) {
  const abuser = abusers[name];
  if (!abuser) {
    throw new Error(`Abuser ${name} not found.`);
  }
  return abuser;
}

export function getAllAbusers() {
  return Object.keys(abusers).map(name => abusers[name]);
}

export function addAbuser(abuser: BaseAbuser) {
  abuser.init();
  abusers[abuser.name] = abuser;
}
