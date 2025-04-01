import { AxiosError, AxiosResponse } from 'axios';
import {
  catchError,
  map,
  Observable,
  OperatorFunction,
  throwError,
} from 'rxjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * handles the api response and caught errors appropriately`
 */
export const handleHttpResponse = <
  T extends AxiosResponse,
  R,
>(): OperatorFunction<T, R> => {
  return (source: Observable<T>): Observable<R> => {
    return source.pipe(
      map(({ data, status }) => ({
        success: true,
        statusCode: status,
        ...data,
      })),
      catchError((error: AxiosError<HttpException>) => {
        const errorMessage =
          error.response?.data?.message ||
          'Something went wrong. Please try again later.';
        const httpStatus = error.response?.status;

        switch (httpStatus) {
          case HttpStatus.BAD_REQUEST:
            return throwError(() => new BadRequestException(errorMessage));
          case HttpStatus.UNAUTHORIZED:
            return throwError(() => new UnauthorizedException(errorMessage));
          case HttpStatus.NOT_FOUND:
            return throwError(() => new NotFoundException(errorMessage));
          default:
            return throwError(
              () =>
                new InternalServerErrorException(
                  `Server Error: an exception occurred on Termii's end. `,
                ),
            );
        }
      }),
    );
  };
};
