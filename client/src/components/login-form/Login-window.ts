'use strict'

import CustomStorage, {ICustomStorage} from "../../services/Storage/CustomStorage";

const Storage = new CustomStorage();

const passwordField = document.querySelector('#password-input') as HTMLInputElement;
const logInfield = document.querySelector('#login-input') as HTMLInputElement;
const logInBtn = document.querySelector('#login-button') as HTMLButtonElement;
const loginWind = document.querySelector('#login-modal') as HTMLElement;
const loginOverlay = document.querySelector('#login-overlay') as HTMLElement;
const loginWrapper = document.querySelector('#login-wrapper') as HTMLElement;
const passwordWrapper = document.querySelector('#password-wrapper') as HTMLElement;
const savePasswordCheckbox = document.querySelector('#save-password-checkbox-input') as HTMLInputElement;

const passwordName: string = passwordField.value;
const trimmedLoginValue: string = logInfield.value.trim();

export default function LoginWindow() {
    loginOverlay.style.display = 'flex';

    logInBtn.addEventListener('click', (e: Event) => {

        Storage.setItem('login', logInfield.value);
        Storage.setItem('password', passwordField.value);
        
        async function ActiveDirectoryFetch() {
            
            const response = await fetch('http://10.180.0.207:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: trimmedLoginValue,
                    password: passwordName
                })
            })

            console.log(response.status)

            if (response.status === 200) {
    
                if (savePasswordCheckbox?.checked) {
                    sessionStorage.setItem('login', Storage.items.login!);
                    sessionStorage.setItem('password', Storage.items.password!);
                }
    
                loginOverlay.remove();
            }
    
                else if (response.status !== 200) {
                    console.log(response.statusText)
                    console.log(response.text)

                    const throwErr = document.createElement('p');
    
                    passwordWrapper.style.border = '1px solid red';
                    passwordWrapper.classList.add('shake-animation');
                    throwErr.setAttribute('id', 'error-msg');
                    throwErr.textContent = 'Typed password is incorrect';
    
                    setTimeout(() => {
                        passwordWrapper.classList.remove('shake-animation');
                    }, 350);
    
                    setTimeout(() => {
                        passwordWrapper.style.removeProperty('border');
                    }, 1000);
                    
                    setTimeout(() => {
                        throwErr.remove();
                    }, 2500);
                    
                    /*if (e) {
    
                        if (throwErr) {
                            passwordWrapper?.style.removeProperty('border');
                            passwordWrapper?.classList.remove('shake-animation');
                            throwErr.remove();
        
                            setTimeout(() => {
                              passwordWrapper?.classList.remove('shake-animation');
                            }, 350);
        
                            setTimeout(() => {
                                passwordWrapper.style.removeProperty('border');
                            }, 1000);
                  
                            setTimeout(() => {
                              throwErr.remove();
                            }, 2500);
                            
                          }
                    }*/
    
                    loginWind.appendChild(throwErr);
                    loginOverlay.appendChild(loginWind);
                    document.body.appendChild(loginOverlay);
                }
            
    
            else if (response.status !== 200) {
                const throwErr = document.createElement('p');
    
                loginWrapper.style.border = '1px solid red';
                loginWrapper.classList.add('shake-animation');
                throwErr.setAttribute('id', 'error-msg');
                throwErr.textContent = 'Typed login is incorrect';
                
                setTimeout(() => {
                    loginWrapper.classList.remove('shake-animation');
                }, 350);
    
                setTimeout(() => {
                    loginWrapper.style.removeProperty('border');
                }, 1000);
    
                setTimeout(() => {
                    throwErr.remove();
                }, 2500);
                
    
                loginWind.appendChild(throwErr);
                loginOverlay.appendChild(loginWind);
                document.body.appendChild(loginOverlay);
            }    
        
        };
        
        ActiveDirectoryFetch();
    })
}
