export class ApiResponseDto<T> {
  ok: boolean;
  message: string;
  data?: T | undefined ;

  constructor(ok: boolean, message: string, data?: T) {
    this.ok = ok;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(false, message, data);
  }
}