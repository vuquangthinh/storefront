"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import Modal from "react-modal";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import ALink from "~/components/features/custom-link";
import { LOGIN_MUTATION, REGISTER_CUSTOMER_MUTATION } from "~/graphql/auth";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
};

interface CurrentUserResult {
  __typename: "CurrentUser";
  id: string;
  identifier: string;
}

interface ErrorResult {
  __typename:
    | "InvalidCredentialsError"
    | "NotVerifiedError"
    | "NativeAuthStrategyError"
    | "MissingPasswordError"
    | "PasswordValidationError"
    | "AlreadyRegisteredError";
  message?: string | null;
}

type LoginResponse = CurrentUserResult | ErrorResult | null | undefined;
type RegisterResponse = { __typename: "Success"; success: boolean } | ErrorResult | null | undefined;

export default function LoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    agree: false,
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const [execLogin, { loading: loginLoading }] = useMutation<{ login: LoginResponse }>(LOGIN_MUTATION);
  const [execRegister, { loading: registerLoading }] = useMutation<{ registerCustomerAccount: RegisterResponse }>(
    REGISTER_CUSTOMER_MUTATION
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const el = document.getElementById("__next") || document.body;
      try {
        Modal.setAppElement(el as HTMLElement);
      } catch {
        // noop
      }
    }
  }, []);

  const resetForms = () => {
    setLoginForm({ username: "", password: "", rememberMe: false });
    setRegisterForm({ firstName: "", lastName: "", emailAddress: "", password: "", agree: false });
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
  };

  function closeModal() {
    const overlay = document.querySelector(".ReactModal__Overlay");
    const content = document.querySelector(".login-popup.ReactModal__Content");
    const popupOverlay = document.querySelector(".login-popup-overlay.ReactModal__Overlay");

    overlay?.classList.add("removed");
    content?.classList.remove("ReactModal__Content--after-open");
    popupOverlay?.classList.remove("ReactModal__Overlay--after-open");

    setTimeout(() => {
      setOpen(false);
      resetForms();
    }, 330);
  }

  function openModal(e: React.MouseEvent<HTMLAnchorElement>, tabIndex = 0) {
    e.preventDefault();
    setSelectedTab(tabIndex);
    setLoginError(null);
    setRegisterError(null);
    setRegisterSuccess(null);
    setOpen(true);
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (!loginForm.username || !loginForm.password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    try {
      const { data } = await execLogin({
        variables: {
          username: loginForm.username,
          password: loginForm.password,
          rememberMe: loginForm.rememberMe,
        },
      });

      const result = data?.login;

      if (result?.__typename === "CurrentUser") {
        closeModal();
        router.refresh();
        router.push("/account");
      } else {
        setLoginError(result?.message ?? "Unable to sign in.");
      }
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    if (!registerForm.emailAddress || !registerForm.password) {
      setRegisterError("Email and password are required.");
      return;
    }

    if (!registerForm.agree) {
      setRegisterError("You must agree to the privacy policy.");
      return;
    }

    try {
      const { data } = await execRegister({
        variables: {
          input: {
            emailAddress: registerForm.emailAddress,
            password: registerForm.password,
            firstName: registerForm.firstName || undefined,
            lastName: registerForm.lastName || undefined,
          },
        },
      });

      const result = data?.registerCustomerAccount;

      if (result?.__typename === "Success") {
        setRegisterSuccess("Account created. Please check your email to verify before signing in.");
        setSelectedTab(0);
      } else {
        setRegisterError(result?.message ?? "Unable to register.");
      }
    } catch (error: unknown) {
      setRegisterError(error instanceof Error ? error.message : "Unable to register.");
    }
  };

  return (
    <>
      <a className="login-link" href="#" onClick={(e) => openModal(e, 0)}>
        <i className="d-icon-user"></i>Sign in
      </a>
      <span className="delimiter">/</span>
      <a className="register-link ml-0" onClick={(e) => openModal(e, 1)} href="#">
        Register
      </a>

      {open && (
        <Modal
          isOpen={open}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Login Modal"
          className="login-popup"
          overlayClassName="login-popup-overlay"
          shouldReturnFocusAfterClose={false}
          id="login-modal"
        >
          <div className="form-box">
            <div className="tab tab-nav-simple tab-nav-boxed form-tab">
              <Tabs
                selectedIndex={selectedTab}
                onSelect={(index) => setSelectedTab(index)}
                selectedTabClassName="active"
                selectedTabPanelClassName="active"
              >
                <TabList className="nav nav-tabs nav-fill align-items-center border-no justify-content-center mb-5">
                  <Tab className="nav-item">
                    <span className="nav-link border-no lh-1 ls-normal">Sign in</span>
                  </Tab>
                  <li className="delimiter">or</li>
                  <Tab className="nav-item">
                    <span className="nav-link border-no lh-1 ls-normal">Register</span>
                  </Tab>
                </TabList>

                <div className="tab-content">
                  <TabPanel className="tab-pane">
                    <form onSubmit={handleLoginSubmit}>
                      <div className="form-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          id="signin-email"
                          name="signin-email"
                          placeholder="Email Address *"
                          value={loginForm.username}
                          onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="password"
                          className="form-control"
                          id="signin-password"
                          placeholder="Password *"
                          name="signin-password"
                          value={loginForm.password}
                          onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-footer">
                        <div className="form-checkbox">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            id="signin-remember"
                            name="signin-remember"
                            checked={loginForm.rememberMe}
                            onChange={(event) => setLoginForm((prev) => ({ ...prev, rememberMe: event.target.checked }))}
                          />
                          <label className="form-control-label" htmlFor="signin-remember">
                            Remember me
                          </label>
                        </div>
                        <ALink href="/reset-password" className="lost-link">
                          Lost your password?
                        </ALink>
                      </div>

                      {loginError && <p className="text-danger mt-3 mb-0">{loginError}</p>}

                      <button className="btn btn-dark btn-block btn-rounded mt-4" type="submit" disabled={loginLoading}>
                        {loginLoading ? "Logging in..." : "Login"}
                      </button>
                    </form>
                  </TabPanel>

                  <TabPanel className="tab-pane">
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-group">
                        <label htmlFor="register-first-name">First name (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="register-first-name"
                          name="register-first-name"
                          value={registerForm.firstName}
                          onChange={(event) => setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="register-last-name">Last name (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="register-last-name"
                          name="register-last-name"
                          value={registerForm.lastName}
                          onChange={(event) => setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="register-email">Email address *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="register-email"
                          name="register-email"
                          placeholder="you@example.com"
                          value={registerForm.emailAddress}
                          onChange={(event) => setRegisterForm((prev) => ({ ...prev, emailAddress: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="register-password">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="register-password"
                          name="register-password"
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-footer">
                        <div className="form-checkbox">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            id="register-agree"
                            name="register-agree"
                            checked={registerForm.agree}
                            onChange={(event) => setRegisterForm((prev) => ({ ...prev, agree: event.target.checked }))}
                            required
                          />
                          <label className="form-control-label" htmlFor="register-agree">
                            I agree to the privacy policy
                          </label>
                        </div>
                      </div>

                      {registerError && <p className="text-danger mt-3 mb-2">{registerError}</p>}
                      {registerSuccess && <p className="text-success mt-3 mb-2">{registerSuccess}</p>}

                      <button className="btn btn-dark btn-block btn-rounded mt-2" type="submit" disabled={registerLoading}>
                        {registerLoading ? "Registering..." : "Register"}
                      </button>
                    </form>
                  </TabPanel>
                </div>
              </Tabs>
            </div>
          </div>

          <button title="Close (Esc)" type="button" className="mfp-close" onClick={closeModal}>
            <span>×</span>
          </button>
        </Modal>
      )}
    </>
  );
}