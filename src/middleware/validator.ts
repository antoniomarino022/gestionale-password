import validator from 'validator';
import PasswordValidator from 'password-validator';

// Definizione dello schema della password
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)                              // Lunghezza minima di 8 caratteri
  .has().uppercase()                       // Deve contenere almeno una lettera maiuscola
  .has().lowercase()                       // Deve contenere almeno una lettera minuscola
  .has().digits()                          // Deve contenere almeno un numero
  .not().spaces();                         // Non deve contenere spazi


export function validateEmail(email:string){
return email && validator.isEmail(email);
}

export function validatePassword(password:string){
    return passwordSchema.validate(password);
}