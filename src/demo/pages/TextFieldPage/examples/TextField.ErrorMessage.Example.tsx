import 'es6-promise';
import * as React from 'react';
import {
  TextField
} from '../../../../index';
import { NumberTextField } from './NumberTextField';

export class TextFieldErrorMessageExample extends React.Component<{}, {}> {
  public constructor(props: any) {
    super(props);

    this._getErrorMessage = this._getErrorMessage.bind(this);
    this._getErrorMessagePromise = this._getErrorMessagePromise.bind(this);
  }

  public render() {
    return (
      <div>
        <TextField
          label='TextField with a string-based validator. Hint: the length of the input string must be less than 3.'
          onGetErrorMessage={this._getErrorMessage}
        />
        <TextField
          label='TextField with a Promise-based validator. Hint: the length of the input string must be less than 3.'
          onGetErrorMessage={this._getErrorMessagePromise}
        />
        <TextField
          label='TextField with a string-based validator. Hint: the length of the input string must be less than 3.'
          value='It should show an error message under this error message on render.'
          onGetErrorMessage={this._getErrorMessage}
        />
        <TextField
          label='TextField with a Promise-based validator. Hint: the length of the input string must be less than 3.'
          value='It should show an error message under this error message 5 seconds after render.'
          onGetErrorMessage={this._getErrorMessagePromise}
        />
        <NumberTextField
          label='Number TextField with valid initial value'
          initialValue='100'
        />
        <NumberTextField
          label='Number TextField with invalid initial value'
          initialValue='Not a number'
        />
      </div>
    );
  }

  private _getErrorMessage(value: string): string {
    return value.length < 3
      ? ''
      : `The length of the input value should less than 3, actual is ${value.length}.`;
  }

  private _getErrorMessagePromise(value: string): Promise<string> {
    return new Promise((resolve) => {
      // resolve the promise after 3 second.
      setTimeout(() => resolve(this._getErrorMessage(value)), 5000);
    });
  }
}