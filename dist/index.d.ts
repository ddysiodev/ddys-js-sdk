export const DEFAULT_BASE_URL: 'https://ddys.io/api/v1';

export type MovieTypeCode = 'movie' | 'series' | 'variety' | 'anime';
export type MovieSort = 'latest' | 'rating' | 'popular';
export type SearchType = 'movie' | 'share' | 'request';
export type ActivityType = 'share' | 'request';
export type CommentTargetType = 'movie' | 'share' | 'request';
export type FollowAction = 'follow' | 'unfollow';

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  statuses?: number[];
}

export interface DdysFetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export type FetchLike = (url: string | URL, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}) => Promise<DdysFetchResponse>;

export interface DdysClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
  fetch?: FetchLike;
  headers?: Record<string, string>;
  userAgent?: string;
  retry?: RetryOptions | boolean;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE' | string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  retry?: RetryOptions | boolean;
}

export type QueryValue = string | number | boolean | null | undefined | Array<string | number | boolean | null | undefined>;

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  perPage?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DictionaryItem {
  id?: number;
  name: string;
  code: string;
}

export interface MovieListParams extends PaginationParams {
  type?: MovieTypeCode;
  genre?: string;
  region?: string;
  year?: number;
  sort?: MovieSort;
}

export interface MovieListItem {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  year: number;
  poster?: string | null;
  rating?: number | null;
  douban_id?: string | null;
  imdb_id?: string | null;
  is_completed?: boolean;
  type?: string | null;
  type_code?: string | null;
  region?: string | null;
  region_code?: string | null;
  genres?: DictionaryItem[];
  created_at?: string;
  updated_at?: string;
  url: string;
}

export interface MovieDetail extends MovieListItem {
  intro?: string | null;
  director: string[];
  actors: string[];
  warning_tags: string[];
  online_sources_count: number;
  download_sources_count: number;
  comments_count: number;
}

export interface OnlineResource {
  id: number;
  name: string;
  url: string;
  quality?: string | null;
  format?: string | null;
}

export interface DownloadResource {
  id: number;
  name: string;
  url: string;
  quality?: string | null;
  download_type?: string | null;
  size?: string | null;
  extract_code?: string | null;
}

export interface MovieSources {
  online: OnlineResource[];
  download: DownloadResource[];
}

export interface MovieRelated {
  series: MovieListItem[];
  related: MovieListItem[];
}

export interface Comment {
  id: number;
  content: string;
  username: string;
  avatar?: string | null;
  created_at: string;
}

export interface SearchParams extends PaginationParams {
  q: string;
  type?: SearchType;
}

export interface SearchSuggestion {
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  year?: number | null;
  poster?: string | null;
  rating?: number | null;
  url: string;
}

export interface HotMovie extends MovieListItem {
  online_sources?: number;
  download_sources?: number;
}

export interface LatestParams {
  limit?: number;
}

export interface CalendarParams {
  year?: number;
  month?: number;
}

export interface CalendarMovie {
  id?: number;
  title: string;
  title_en?: string | null;
  slug?: string;
  year?: number | null;
  poster?: string | null;
  rating?: number | null;
  date?: string;
  release_date?: string;
  url?: string;
  [key: string]: unknown;
}

export interface CalendarData {
  year?: number;
  month?: number;
  days?: Record<string, CalendarMovie[]>;
  movies?: CalendarMovie[];
  [key: string]: unknown;
}

export interface Collection {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  poster?: string | null;
  movie_count?: number;
  movies_count?: number;
  created_at?: string;
  updated_at?: string;
  url?: string;
}

export interface CollectionDetail extends Collection {
  movies: MovieListItem[];
  meta?: PaginationMeta;
}

export interface Share {
  id: number;
  title: string;
  resource_type?: string | null;
  resource_types?: string[];
  quality?: string | null;
  note?: string | null;
  username: string;
  avatar?: string | null;
  share_tag?: string | null;
  created_at: string;
  updated_at?: string;
  url?: string;
}

export interface ShareResource {
  id: number;
  type: string;
  url: string;
  extract_code?: string | null;
}

export interface ShareDetail extends Share {
  resources: ShareResource[];
  comments_count: number;
}

export interface UserRequest {
  id: number;
  title: string;
  year?: number | null;
  type?: string | null;
  description?: string | null;
  status: string;
  username: string;
  avatar?: string | null;
  created_at: string;
  url: string;
}

export interface CreateRequestInput {
  title: string;
  year?: number | null;
  type?: MovieTypeCode | '';
  description?: string;
  douban_id?: string;
}

export interface CreateRequestResult {
  id: number;
  title: string;
  year?: number | null;
  type?: string | null;
  status: string;
  reward?: number;
  username: string;
  created_at: string;
  url: string;
}

export interface ActivityParams extends PaginationParams {
  type?: ActivityType;
}

export interface Activity {
  type: ActivityType;
  id: number;
  title: string;
  username: string;
  avatar?: string | null;
  created_at: string;
  url: string;
}

export interface PublicUserProfile {
  id?: number;
  username: string;
  avatar?: string | null;
  bio?: string | null;
  share_tag?: string | null;
  shares_count: number;
  followers_count: number;
  following_count: number;
  joined_at: string;
  url?: string;
}

export interface CurrentUserProfile extends PublicUserProfile {
  id: number;
  email: string;
}

export interface CreateCommentInput {
  target_type: CommentTargetType;
  target_id: number;
  content: string;
}

export interface CommentCreateResult {
  id: number;
  content: string;
  target_type: CommentTargetType;
  target_id: number;
  username: string;
  created_at: string;
}

export interface CommentDeleteResult {
  id: number;
  deleted: boolean;
}

export interface ReportInvalidResourceInput {
  resource_id: number;
  movie_id: number;
}

export interface ReportResult {
  reported: boolean;
}

export interface FollowInput {
  username: string;
  action: FollowAction;
}

export interface FollowResult {
  action: 'followed' | 'unfollowed';
  username: string;
}

export interface MovieEndpoints {
  list(params?: MovieListParams): Promise<PaginatedResult<MovieListItem>>;
  detail(slug: string): Promise<MovieDetail>;
  sources(slug: string): Promise<MovieSources>;
  related(slug: string): Promise<MovieRelated>;
  comments(slug: string, params?: PaginationParams): Promise<PaginatedResult<Comment>>;
}

export interface DictionaryEndpoints {
  types(): Promise<DictionaryItem[]>;
  genres(): Promise<DictionaryItem[]>;
  regions(): Promise<DictionaryItem[]>;
}

export interface CollectionEndpoints {
  list(params?: PaginationParams): Promise<PaginatedResult<Collection>>;
  detail(slug: string, params?: PaginationParams): Promise<CollectionDetail>;
}

export interface ShareEndpoints {
  list(params?: PaginationParams): Promise<PaginatedResult<Share>>;
  detail(id: number): Promise<ShareDetail>;
}

export interface RequestEndpoints {
  list(params?: PaginationParams): Promise<PaginatedResult<UserRequest>>;
  create(input: CreateRequestInput): Promise<CreateRequestResult>;
}

export interface ActivityEndpoints {
  list(params?: ActivityParams): Promise<PaginatedResult<Activity>>;
}

export interface UserEndpoints {
  profile(username: string): Promise<PublicUserProfile>;
}

export interface CommentEndpoints {
  create(input: CreateCommentInput): Promise<CommentCreateResult>;
  delete(id: number): Promise<CommentDeleteResult>;
}

export interface ReportEndpoints {
  invalidResource(input: ReportInvalidResourceInput): Promise<ReportResult>;
}

export interface FollowEndpoints {
  set(input: FollowInput): Promise<FollowResult>;
  follow(username: string): Promise<FollowResult>;
  unfollow(username: string): Promise<FollowResult>;
}

export class DdysApiError extends Error {
  readonly name: string;
  readonly status?: number;
  readonly method: string;
  readonly endpoint: string;
  readonly response?: unknown;
  readonly cause?: unknown;
  constructor(message: string, options?: {
    status?: number;
    method?: string;
    endpoint?: string;
    response?: unknown;
    cause?: unknown;
  });
}

export class DdysTimeoutError extends DdysApiError {}
export class DdysNetworkError extends DdysApiError {}
export class DdysParseError extends DdysApiError {}

export class DdysClient {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;
  readonly movies: MovieEndpoints;
  readonly dictionaries: DictionaryEndpoints;
  readonly collections: CollectionEndpoints;
  readonly shares: ShareEndpoints;
  readonly requests: RequestEndpoints;
  readonly activities: ActivityEndpoints;
  readonly users: UserEndpoints;
  readonly comments: CommentEndpoints;
  readonly reports: ReportEndpoints;
  readonly follow: FollowEndpoints;

  constructor(options?: DdysClientOptions);
  request<T = unknown>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  get<T = unknown>(path: string, query?: Record<string, QueryValue>, options?: Omit<RequestOptions, 'method' | 'query'>): Promise<ApiSuccess<T>>;
  post<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiSuccess<T>>;
  delete<T = unknown>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiSuccess<T>>;
  search(params: SearchParams): Promise<PaginatedResult<MovieListItem | Share | UserRequest>>;
  suggest(q: string): Promise<SearchSuggestion[]>;
  hot(): Promise<HotMovie[]>;
  latest(params?: LatestParams): Promise<MovieListItem[]>;
  calendar(params?: CalendarParams): Promise<CalendarData>;
  me(): Promise<CurrentUserProfile>;
}

export function createDdysClient(options?: DdysClientOptions): DdysClient;

export default createDdysClient;
