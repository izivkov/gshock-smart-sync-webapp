import { Action, RunEnvironment, RunMode } from "./Action";
import GShockAPI from "@api/GShockAPI";

export class SetExerciseProfileAction extends Action {
  public profile: any = null;

  constructor() {
    super('Set Exercise Profile', true, RunMode.ASYNC);
  }

  async run(payload?: any) {
    console.log('Running SetExerciseProfileAction');
    if (payload) {
      await GShockAPI.setExerciseProfile(payload);
    } else {
      const current = await GShockAPI.getExerciseProfile();
      await GShockAPI.setExerciseProfile(current);
    }
  }

  shouldRun(runEnvironment: RunEnvironment): boolean {
    return runEnvironment === RunEnvironment.VOICE_COMMAND ||
      runEnvironment === RunEnvironment.DIRECT_INVOCATION;
  }
}
