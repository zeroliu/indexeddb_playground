import {IdbAbuser} from './idb_abuser';
import {BaseAbuser} from './base_abuser';
import {LocalStorageAbuser} from './local_storage_abuser';
import {CacheAbuser} from './cache_abuser';

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

function addAbuser(abuser: BaseAbuser) {
  abuser.init();
  abusers[abuser.name] = abuser;
}

addAbuser(new IdbAbuser());
addAbuser(new CacheAbuser());
addAbuser(new LocalStorageAbuser());
