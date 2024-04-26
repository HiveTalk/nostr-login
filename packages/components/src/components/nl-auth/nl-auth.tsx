import { Component, Event, EventEmitter, Fragment, h, Prop, State, Watch } from '@stencil/core';
import { CURRENT_MODULE, Info, RecentType } from '@/types';
import { state } from '@/store';

@Component({
  tag: 'nl-auth',
  styleUrl: 'nl-auth.css',
  shadow: true,
})
export class NlAuth {
  @Prop() theme: 'default' | 'ocean' | 'lemonade' | 'purple' = 'default';
  @Prop() startScreen: string = CURRENT_MODULE.WELCOME;
  @Prop() isSignInWithExtension: boolean = true;
  @Prop() isLoading: boolean = false;
  @Prop() isLoadingExtension: boolean = false;
  @Prop() authUrl: string = '';
  @Prop() error: string = '';
  @Prop({ mutable: true }) accounts: Info[] = [];
  @Prop({ mutable: true }) recents: RecentType[] = [];

  @State() darkMode: boolean = false;
  @State() themeState: 'default' | 'ocean' | 'lemonade' | 'purple' = 'default';

  @Event() nlCloseModal: EventEmitter;
  @Event() handleChangeDarkMode: EventEmitter<string>;

  @Watch('isLoading')
  watchLoadingHandler(newValue: boolean) {
    state.isLoading = newValue;
  }

  @Watch('isLoadingExtension')
  watchLoadingExtensionHandler(newValue: boolean) {
    state.isLoadingExtension = newValue;
  }

  @Watch('authUrl')
  watchAuthUrlHandler(newValue: string) {
    state.authUrl = newValue;
  }

  @Watch('error')
  watchErrorHandler(newValue: string) {
    state.error = newValue;
  }

  handleClose() {
    this.nlCloseModal.emit();
  }

  handleChangeTheme() {
    this.darkMode = !this.darkMode;
    this.handleChangeDarkMode.emit(String(!this.darkMode));
    localStorage.setItem('nl-dark-mode', `${this.darkMode}`);
  }

  componentWillLoad() {
    this.themeState = this.theme;
    state.screen = this.startScreen as CURRENT_MODULE;
    state.prevScreen = CURRENT_MODULE.WELCOME; //this.startScreen as CURRENT_MODULE;

    const getDarkMode = localStorage.getItem('nl-dark-mode');

    if (getDarkMode) {
      this.darkMode = JSON.parse(getDarkMode);
    } else {
      this.darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  handleClickToBack() {
    state.screen = state.prevScreen;

    // reset
    state.isLoading = false;
    state.isLoadingExtension = false;
    state.authUrl = '';
  }

  render() {
    const classWrapper = `w-full h-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto flex items-center ${this.darkMode ? 'dark' : ''}`;

    const renderModule = () => {
      switch (state.screen) {
        case CURRENT_MODULE.WELCOME:
          return <nl-welcome isSignInWithExtension={this.isSignInWithExtension} />;
        case CURRENT_MODULE.LOGIN:
          return <nl-signin />;
        case CURRENT_MODULE.SIGNUP:
          return <nl-signup />;
        case CURRENT_MODULE.INFO:
          return <nl-info />;
        case CURRENT_MODULE.EXTENSION:
          return <nl-info-extension />;
        case CURRENT_MODULE.LOGIN_READ_ONLY:
          return <nl-signin-read-only />;
        case CURRENT_MODULE.LOGIN_BUNKER_URL:
          return <nl-signin-bunker-url />;
        case CURRENT_MODULE.PREVIOUSLY_LOGGED:
          return <nl-previously-logged accounts={this.accounts} recents={this.recents} />;
        default:
          return <nl-welcome isSignInWithExtension={this.isSignInWithExtension} />;
      }
    };

    return (
      <div class={`theme-${this.themeState}`}>
        <div class={classWrapper}>
          <div onClick={() => this.handleClose()} class="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 z-[80]" />

          <div class="nl-bg relative z-[81] w-full flex flex-col rounded-xl sm:max-w-lg sm:w-full sm:mx-auto">
            <div class="flex justify-between items-center py-3 px-4">
              <div class="flex gap-2 items-center">
                <svg class="w-7 h-7" width="225" height="224" viewBox="0 0 225 224" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="224.047" height="224" rx="64" fill="#6951FA" />
                  <path
                    d="M162.441 135.941V88.0593C170.359 85.1674 176 77.5348 176 68.6696C176 57.2919 166.708 48 155.33 48C143.953 48 134.661 57.2444 134.661 68.6696C134.661 77.5822 140.302 85.1674 148.219 88.0593V135.941C147.698 136.13 147.176 136.367 146.655 136.604L87.3956 77.3452C88.6282 74.6904 89.2919 71.7511 89.2919 68.6696C89.2919 57.2444 80.0474 48 68.6696 48C57.2919 48 48 57.2444 48 68.6696C48 77.5822 53.6415 85.1674 61.5585 88.0593V135.941C53.6415 138.833 48 146.465 48 155.33C48 166.708 57.2444 176 68.6696 176C80.0948 176 89.3393 166.708 89.3393 155.33C89.3393 146.418 83.6978 138.833 75.7807 135.941V88.0593C76.3022 87.8696 76.8237 87.6326 77.3452 87.3956L136.604 146.655C135.372 149.31 134.708 152.249 134.708 155.33C134.708 166.708 143.953 176 155.378 176C166.803 176 176.047 166.708 176.047 155.33C176.047 146.418 170.406 138.833 162.489 135.941H162.441Z"
                    fill="white"
                  />
                </svg>
                <p class="font-bold nl-logo text-base">
                  Nostr <span class="font-light">Login</span>
                </p>
              </div>

              <div class="flex gap-1">
                {/* <button
                  onClick={() => this.handleChangeTheme()}
                  type="button"
                  class="nl-action-button flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent"
                >
                  <span class="sr-only">Change theme</span>
                  {this.darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="flex-shrink-0 w-5 h-5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="flex-shrink-0 w-5 h-5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                      />
                    </svg>
                  )}
                </button> */}
                {!state.isLoading && (
                  <button
                    onClick={() => (state.screen = CURRENT_MODULE.INFO)}
                    type="button"
                    class="nl-action-button flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent"
                  >
                    <span class="sr-only">Info</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="flex-shrink-0 w-5 h-5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => this.handleClose()}
                  type="button"
                  class="nl-action-button flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent"
                >
                  <span class="sr-only">Close</span>
                  <svg
                    class="flex-shrink-0 w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {state.screen !== CURRENT_MODULE.PREVIOUSLY_LOGGED && state.screen !== CURRENT_MODULE.WELCOME && !state.isLoading && (
              <div class="p-4">
                <button
                  onClick={() => this.handleClickToBack()}
                  type="button"
                  class="nl-action-button flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent  dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  data-hs-overlay="#hs-vertically-centered-modal"
                >
                  <span class="sr-only">Back</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="flex-shrink-0 w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
              </div>
            )}
            {state.isLoading || state.authUrl ? (
              <nl-loading />
            ) : (
              <Fragment>
                {renderModule()}
                {state.screen !== CURRENT_MODULE.INFO &&
                  state.screen !== CURRENT_MODULE.WELCOME &&
                  state.screen !== CURRENT_MODULE.EXTENSION &&
                  state.screen !== CURRENT_MODULE.PREVIOUSLY_LOGGED && (
                    <Fragment>
                      {state.screen === CURRENT_MODULE.SIGNUP ? (
                        <div class="p-4 overflow-y-auto">
                          <p class="nl-footer font-light text-center text-sm pt-3 max-w-96 mx-auto">
                            If you already have an account please{' '}
                            <span onClick={() => (state.screen = CURRENT_MODULE.LOGIN)} class="cursor-pointer text-blue-400">
                              log in
                            </span>
                            .
                          </p>
                        </div>
                      ) : (
                        <div class="p-4 overflow-y-auto">
                          <p class="nl-footer font-light text-center text-sm pt-3 max-w-96 mx-auto">
                            If you don't have an account please{' '}
                            <span onClick={() => (state.screen = CURRENT_MODULE.SIGNUP)} class="cursor-pointer text-blue-400">
                              sign up
                            </span>
                            .
                          </p>
                        </div>
                      )}
                    </Fragment>
                  )}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }
}
