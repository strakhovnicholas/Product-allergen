// Генератор StarUML 1.x XPD (.uml) для auth-service
// Запуск: node generate-auth-uml.mjs
// Результат: ../staruml/auth-service.uml
//
// Содержит 4 диаграммы:
//   1. Use Case (UC-01..UC-04 + 3 вкл. UC)
//   2. Class (по пакетам controller / service / security / persistence / dto / exception / config)
//   3. Component (компоненты auth-service + БД)
//   4. Deployment (узлы: Клиент, Docker Host со вложенными контейнерами)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===================== утилиты =====================
function newGuid() {
  const b64 = crypto.randomBytes(16).toString('base64');
  return b64.replace(/==$/, 'AA');
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const L = [];
function w(s) { L.push(s); }

// ============= переиспользуемые блоки =============
function edgeLabel(name, guid, modelGuid, alpha, distance, pos, text) {
  w(`<XPD:OBJ name="${name}" type="EdgeLabelView" guid="${guid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">${text ? 'True' : 'False'}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Alpha" type="real">${alpha}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Distance" type="real">${distance}</XPD:ATTR>`);
  if (pos) w(`<XPD:ATTR name="EdgePosition" type="EdgePositionKind">${pos}</XPD:ATTR>`);
  if (text) w(`<XPD:ATTR name="Text" type="string">${escapeXml(text)}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
}

function qualifierComp(name, guid, modelGuid) {
  w(`<XPD:OBJ name="${name}" type="UMLQualifierCompartmentView" guid="${guid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:ATTR name="Left" type="integer">-1000</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">-1000</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">50</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">8</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
}

// общий "конверт" из NameLabel + StereotypeLabel + PropertyLabel
function nameCompartment(guid, nameLabelGuid, stereoLabelGuid, propLabelGuid, text, stereoText) {
  w(`<XPD:OBJ name="NameCompartment" type="UMLNameCompartmentView" guid="${guid}">`);
  w(`<XPD:OBJ name="NameLabel" type="LabelView" guid="${nameLabelGuid}">`);
  w(`<XPD:ATTR name="FontStyle" type="integer">1</XPD:ATTR>`);
  w(`<XPD:ATTR name="Text" type="string">${escapeXml(text)}</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="StereotypeLabel" type="LabelView" guid="${stereoLabelGuid}">`);
  if (stereoText) {
    w(`<XPD:ATTR name="Text" type="string">${escapeXml(stereoText)}</XPD:ATTR>`);
  } else {
    w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  }
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="PropertyLabel" type="LabelView" guid="${propLabelGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// ===== ассоциация / зависимость : полный пакет EdgeLabel =====
function fullAssociationView(a, headViewGuid, tailViewGuid, modelGuid, x1, y1, x2, y2, label) {
  w(`<XPD:OBJ name="OwnedViews[${a.idx}]" type="UMLAssociationView" guid="${a.viewGuid}">`);
  w(`<XPD:ATTR name="LineStyle" type="LineStyleKind">lsRectilinear</XPD:ATTR>`);
  w(`<XPD:ATTR name="Points" type="Points">${x1},${y1};${x2},${y2}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Head">${headViewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Tail">${tailViewGuid}</XPD:REF>`);
  edgeLabel('NameLabel', newGuid(), modelGuid, '1,5707963267949', '15', null, label);
  edgeLabel('StereotypeLabel', newGuid(), modelGuid, '1,5707963267949', '30');
  edgeLabel('PropertyLabel', newGuid(), modelGuid, '-1,5707963267949', '15');
  const endA = newGuid(), endB = newGuid();
  edgeLabel('HeadRoleNameLabel', newGuid(), endA, '-0,523598775598299', '30', 'epHead');
  edgeLabel('TailRoleNameLabel', newGuid(), endB, '0,523598775598299', '30', 'epTail');
  edgeLabel('HeadMultiplicityLabel', newGuid(), endA, '0,523598775598299', '25', 'epHead');
  edgeLabel('TailMultiplicityLabel', newGuid(), endB, '-0,523598775598299', '25', 'epTail');
  edgeLabel('HeadPropertyLabel', newGuid(), endA, '-0,785398163397448', '40', 'epHead');
  edgeLabel('TailPropertyLabel', newGuid(), endB, '0,785398163397448', '40', 'epTail');
  qualifierComp('HeadQualifierCompartment', newGuid(), endA);
  qualifierComp('TailQualifierCompartment', newGuid(), endB);
  w(`</XPD:OBJ>`);
  return { endA, endB };
}

// зависимость (пунктирная стрелка)
function fullDependencyView(idx, viewGuid, headViewGuid, tailViewGuid, modelGuid, x1, y1, x2, y2, label) {
  w(`<XPD:OBJ name="OwnedViews[${idx}]" type="UMLDependencyView" guid="${viewGuid}">`);
  w(`<XPD:ATTR name="LineStyle" type="LineStyleKind">lsRectilinear</XPD:ATTR>`);
  w(`<XPD:ATTR name="Points" type="Points">${x1},${y1};${x2},${y2}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Head">${headViewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Tail">${tailViewGuid}</XPD:REF>`);
  edgeLabel('NameLabel', newGuid(), modelGuid, '1,5707963267949', '15', null, label);
  edgeLabel('StereotypeLabel', newGuid(), modelGuid, '1,5707963267949', '30');
  edgeLabel('PropertyLabel', newGuid(), modelGuid, '-1,5707963267949', '15');
  w(`</XPD:OBJ>`);
}

// ===================== GUID-пул =====================
const G = {
  project: newGuid(),
  // 4 модели верхнего уровня
  ucModel: newGuid(),
  logicalModel: newGuid(),
  componentModel: newGuid(),
  deploymentModel: newGuid(),
  // пакеты внутри Use Case View
  pkgUCMain: newGuid(),
  pkgActors: newGuid(),
  pkgUseCases: newGuid(),
  // в Logical View
  pkgClassMain: newGuid(),
  // в Component View
  pkgCompMain: newGuid(),
  // в Deployment View
  pkgDeployMain: newGuid(),
  // диаграммы
  ucDiagram: newGuid(),
  ucDiagramView: newGuid(),
  clsDiagram: newGuid(),
  clsDiagramView: newGuid(),
  cmpDiagram: newGuid(),
  cmpDiagramView: newGuid(),
  depDiagram: newGuid(),
  depDiagramView: newGuid(),
  // sequence (внутри Logical View)
  collabSet: newGuid(),
  interactionSet: newGuid(),
  seqDiagram: newGuid(),
  seqDiagramView: newGuid(),
};

// ===================== данные =====================

// ---------- use case ----------
const ucActors = [
  { name: 'Клиент',      left: 80,  top: 220, w: 80,  h: 80 },
  { name: 'API Gateway', left: 80,  top: 420, w: 100, h: 80 },
];
const ucUseCases = [
  { name: 'UC-01 Регистрация (POST /auth/register)', left: 260, top: 120, w: 260, h: 70 },
  { name: 'UC-02 Вход (POST /auth/login)',           left: 260, top: 220, w: 260, h: 70 },
  { name: 'UC-03 Выход (POST /auth/logout)',         left: 260, top: 320, w: 260, h: 70 },
  { name: 'UC-04 Обновление токенов (POST /auth/refresh)', left: 260, top: 420, w: 260, h: 70 },
  { name: 'Валидация входных данных',       left: 620, top: 120, w: 220, h: 70 },
  { name: 'Выдача JWT (access + refresh)',  left: 620, top: 220, w: 220, h: 70 },
  { name: 'Хранение refresh в Redis',       left: 620, top: 320, w: 220, h: 70 },
];

for (const a of ucActors) {
  a.modelGuid = newGuid(); a.viewGuid = newGuid();
  a.nameCompGuid = newGuid(); a.nameLabelGuid = newGuid();
  a.stereoLabelGuid = newGuid(); a.propLabelGuid = newGuid();
  a.attrCompGuid = newGuid(); a.opCompGuid = newGuid();
  a.viewRefs = [a.viewGuid, a.attrCompGuid, a.opCompGuid];
  a.associations = [];
}
for (const uc of ucUseCases) {
  uc.modelGuid = newGuid(); uc.viewGuid = newGuid();
  uc.nameCompGuid = newGuid(); uc.nameLabelGuid = newGuid();
  uc.stereoLabelGuid = newGuid(); uc.propLabelGuid = newGuid();
  uc.attrCompGuid = newGuid(); uc.opCompGuid = newGuid();
  uc.extPointCompGuid = newGuid();
  uc.viewRefs = [uc.viewGuid, uc.attrCompGuid, uc.opCompGuid, uc.extPointCompGuid];
}
const ucAssociations = [];
function addUCAssoc(actor, uc) {
  const a = {
    modelGuid: newGuid(), viewGuid: newGuid(),
    end1Guid: newGuid(), end2Guid: newGuid(),
    actor, uc,
  };
  ucAssociations.push(a);
  actor.associations.push(a.end1Guid);
  return a;
}
const clientA = ucActors[0], gwA = ucActors[1];
addUCAssoc(clientA, ucUseCases[0]);
addUCAssoc(clientA, ucUseCases[1]);
addUCAssoc(clientA, ucUseCases[2]);
addUCAssoc(clientA, ucUseCases[3]);
addUCAssoc(gwA, ucUseCases[1]);
addUCAssoc(gwA, ucUseCases[3]);

// ---------- class ----------
const classes = [
  // controller
  { pkg: 'controller', name: 'AuthController',
    attrs: ['- authService : AuthService'],
    ops: ['+ login(LoginRequest) : AuthResponse', '+ register(RegisterRequest) : AuthResponse',
          '+ logout(LogoutRequest) : String', '+ refresh(RefreshRequest) : AuthResponse'],
    left: 80, top: 80, w: 260, h: 140 },
  // service
  { pkg: 'service', name: 'AuthService',
    attrs: ['- userRepository : UserRepository','- passwordEncoder : PasswordEncoder',
            '- authenticationManager : AuthenticationManager','- jwtService : JwtService',
            '- refreshTokenService : RefreshTokenService'],
    ops: ['+ register(RegisterRequest) : AuthResponse','+ login(LoginRequest) : AuthResponse',
          '+ refresh(String) : AuthResponse','+ logout(String) : void'],
    left: 80, top: 260, w: 290, h: 180 },
  { pkg: 'service', name: 'RefreshTokenService',
    attrs: ['- redisTemplate : RedisTemplate'],
    ops: ['+ saveRefreshToken(token, email) : void','+ revokeOldTokensByEmail(email) : void',
          '+ isValid(token) : boolean','+ getEmail(token) : String','+ revokeToken(token) : void'],
    left: 80, top: 480, w: 290, h: 160 },
  // security
  { pkg: 'security', name: 'JwtService',
    attrs: ['- secret : String'],
    ops: ['+ generateAccessToken(email, id) : String','+ generateRefreshToken(email) : String',
          '+ validateToken(token, type) : boolean','+ extractEmail(token) : String'],
    left: 410, top: 80, w: 290, h: 150 },
  { pkg: 'security', name: 'SecurityConfig',
    attrs: [],
    ops: ['+ passwordEncoder() : PasswordEncoder','+ authenticationManager() : AuthenticationManager',
          '+ securityFilterChain() : SecurityFilterChain'],
    left: 410, top: 270, w: 290, h: 120 },
  // persistence
  { pkg: 'persistence', name: 'UserRepository', isInterface: true,
    attrs: [],
    ops: ['+ findByEmail(email) : Optional<User>','+ existsByEmail(email) : boolean'],
    left: 410, top: 430, w: 290, h: 90 },
  { pkg: 'persistence', name: 'User',
    attrs: ['- id : UUID','- email : String','- password : String','- isActive : boolean',
            '- createdAt : LocalDateTime','- updatedAt : LocalDateTime'],
    ops: [],
    left: 410, top: 560, w: 290, h: 150 },
  // dto
  { pkg: 'dto', name: 'LoginRequest', stereo: '<<DTO>>', left: 740, top: 80, w: 200, h: 60, attrs: [], ops: [] },
  { pkg: 'dto', name: 'RegisterRequest', stereo: '<<DTO>>', left: 740, top: 160, w: 200, h: 60, attrs: [], ops: [] },
  { pkg: 'dto', name: 'LogoutRequest', stereo: '<<DTO>>', left: 740, top: 240, w: 200, h: 60, attrs: [], ops: [] },
  { pkg: 'dto', name: 'RefreshRequest', stereo: '<<DTO>>', left: 740, top: 320, w: 200, h: 60, attrs: [], ops: [] },
  { pkg: 'dto', name: 'AuthResponse', stereo: '<<DTO>>',
    attrs: ['+ accessToken : String','+ refreshToken : String'], ops: [],
    left: 740, top: 400, w: 200, h: 90 },
  { pkg: 'dto', name: 'ApiErrorResponse', stereo: '<<DTO>>', left: 740, top: 510, w: 200, h: 60, attrs: [], ops: [] },
  // exception
  { pkg: 'exception', name: 'GlobalExceptionHandler', left: 980, top: 80, w: 240, h: 60, attrs: [], ops: [] },
  { pkg: 'exception', name: 'InvalidCredentialsException', left: 980, top: 160, w: 240, h: 60, attrs: [], ops: [] },
  { pkg: 'exception', name: 'UserAlreadyExistsException', left: 980, top: 240, w: 240, h: 60, attrs: [], ops: [] },
  { pkg: 'exception', name: 'InvalidRefreshTokenException', left: 980, top: 320, w: 240, h: 60, attrs: [], ops: [] },
  { pkg: 'exception', name: 'UserNotFoundException', left: 980, top: 400, w: 240, h: 60, attrs: [], ops: [] },
  // config
  { pkg: 'config', name: 'OpenApiConfig', left: 980, top: 510, w: 240, h: 60, attrs: [], ops: [] },
];
for (const c of classes) {
  c.modelGuid = newGuid(); c.viewGuid = newGuid();
  c.nameCompGuid = newGuid(); c.nameLabelGuid = newGuid();
  c.stereoLabelGuid = newGuid(); c.propLabelGuid = newGuid();
  c.attrCompGuid = newGuid(); c.opCompGuid = newGuid(); c.tplCompGuid = newGuid();
  c.attrs = c.attrs || []; c.ops = c.ops || [];
  c.attrGuids = c.attrs.map(() => newGuid());
  c.attrLabelGuids = c.attrs.map(() => newGuid());
  c.opGuids = c.ops.map(() => newGuid());
  c.opLabelGuids = c.ops.map(() => newGuid());
  c.viewRefs = [c.viewGuid];
}
function findClass(name) { return classes.find(c => c.name === name); }
const classRels = [
  // ассоциации (solid arrow)
  { kind: 'assoc', from: 'AuthController', to: 'AuthService' },
  { kind: 'assoc', from: 'AuthService',    to: 'UserRepository' },
  { kind: 'assoc', from: 'AuthService',    to: 'JwtService' },
  { kind: 'assoc', from: 'AuthService',    to: 'RefreshTokenService' },
  // dependencies (dashed)
  { kind: 'dep',   from: 'UserRepository', to: 'User' },
  { kind: 'dep',   from: 'AuthController', to: 'LoginRequest' },
  { kind: 'dep',   from: 'AuthController', to: 'RegisterRequest' },
  { kind: 'dep',   from: 'AuthController', to: 'LogoutRequest' },
  { kind: 'dep',   from: 'AuthController', to: 'RefreshRequest' },
  { kind: 'dep',   from: 'AuthController', to: 'AuthResponse' },
  { kind: 'dep',   from: 'AuthService',    to: 'AuthResponse' },
  { kind: 'dep',   from: 'GlobalExceptionHandler', to: 'ApiErrorResponse' },
];
for (const r of classRels) {
  r.modelGuid = newGuid(); r.viewGuid = newGuid();
  r.end1Guid = newGuid(); r.end2Guid = newGuid();
  r.fromC = findClass(r.from); r.toC = findClass(r.to);
  if (r.kind === 'assoc') r.fromC.assocs ??= [], r.fromC.assocs.push(r.end1Guid);
}

// ---------- component ----------
const components = [
  { name: 'AuthController',         left: 80,  top: 110, w: 220, h: 70 },
  { name: 'AuthService',            left: 340, top: 110, w: 220, h: 70 },
  { name: 'JwtService',             left: 600, top: 110, w: 220, h: 70 },
  { name: 'RefreshTokenService',    left: 80,  top: 230, w: 220, h: 70 },
  { name: 'UserRepository',         left: 340, top: 230, w: 220, h: 70 },
  { name: 'SecurityConfig',         left: 600, top: 230, w: 220, h: 70 },
  { name: 'GlobalExceptionHandler', left: 340, top: 350, w: 220, h: 70 },
];
for (const c of components) {
  c.modelGuid = newGuid(); c.viewGuid = newGuid();
  c.nameCompGuid = newGuid(); c.nameLabelGuid = newGuid();
  c.stereoLabelGuid = newGuid(); c.propLabelGuid = newGuid();
  c.residentCompGuid = newGuid();
  c.viewRefs = [c.viewGuid];
}
// узлы данных (БД)
const dbNodes = [
  { name: 'PostgreSQL\n(users)',   left: 340, top: 470, w: 220, h: 70 },
  { name: 'Redis\n(refresh)',      left: 80,  top: 470, w: 220, h: 70 },
];
for (const d of dbNodes) {
  d.modelGuid = newGuid(); d.viewGuid = newGuid();
  d.nameCompGuid = newGuid(); d.nameLabelGuid = newGuid();
  d.stereoLabelGuid = newGuid(); d.propLabelGuid = newGuid();
  d.attrCompGuid = newGuid(); d.opCompGuid = newGuid(); d.tplCompGuid = newGuid();
  d.viewRefs = [d.viewGuid];
}

const cmpDeps = [
  { from: 'AuthController', to: 'AuthService' },
  { from: 'AuthService',    to: 'JwtService' },
  { from: 'AuthService',    to: 'RefreshTokenService' },
  { from: 'AuthService',    to: 'UserRepository' },
  { from: 'SecurityConfig', to: 'AuthService' },
  { from: 'GlobalExceptionHandler', to: 'AuthController' },
];
function findCmp(name) { return components.find(c => c.name === name); }
for (const d of cmpDeps) { d.viewGuid = newGuid(); d.modelGuid = newGuid(); d.fromC = findCmp(d.from); d.toC = findCmp(d.to); }
// связи компонент → БД
const cmpToDb = [
  { from: 'UserRepository',     to: dbNodes[0], label: 'JDBC/JPA' },
  { from: 'RefreshTokenService',to: dbNodes[1], label: 'TCP' },
];
for (const d of cmpToDb) { d.viewGuid = newGuid(); d.modelGuid = newGuid(); d.fromC = findCmp(d.from); }

// ---------- deployment ----------
// внешний узел-контейнер
const dHost = {
  name: '<<device>> Docker Host', left: 80, top: 280, w: 1000, h: 380,
};
const dClient = {
  name: '<<device>> Клиент', left: 80, top: 80, w: 280, h: 160,
};
// вложенные ноды Docker Host
const dApp = { name: '<<container>> auth-service :8080', left: 120, top: 350, w: 320, h: 250 };
const dPg  = { name: '<<device>> PostgreSQL :5432', left: 460, top: 350, w: 280, h: 220 };
const dRds = { name: '<<device>> Redis :6379',      left: 760, top: 350, w: 280, h: 220 };

const depNodes = [dClient, dHost, dApp, dPg, dRds];
for (const n of depNodes) {
  n.modelGuid = newGuid(); n.viewGuid = newGuid();
  n.nameCompGuid = newGuid(); n.nameLabelGuid = newGuid();
  n.stereoLabelGuid = newGuid(); n.propLabelGuid = newGuid();
  n.deployCompGuid = newGuid(); n.deployArtGuid = newGuid();
  n.viewRefs = [n.viewGuid];
}
// артефакты (как UMLPartView внутри узлов)
const depArtifacts = [
  { name: 'Mobile / Web App', container: dClient, left: 110, top: 130, w: 220, h: 60 },
  { name: 'auth-service.jar (Spring Boot 3.2 / Java 17)', container: dApp, left: 140, top: 410, w: 280, h: 60 },
  { name: 'allergen_pg (users)', container: dPg, left: 480, top: 420, w: 240, h: 50 },
  { name: 'refresh tokens', container: dRds, left: 780, top: 420, w: 240, h: 50 },
];
for (const a of depArtifacts) {
  a.modelGuid = newGuid(); a.viewGuid = newGuid();
  a.nameCompGuid = newGuid(); a.nameLabelGuid = newGuid();
  a.stereoLabelGuid = newGuid(); a.propLabelGuid = newGuid();
}
// соединения
const depLinks = [
  { fromV: () => depArtifacts[0].viewGuid, toV: () => depArtifacts[1].viewGuid,
    fx: () => depArtifacts[0].left + depArtifacts[0].w / 2, fy: () => depArtifacts[0].top + depArtifacts[0].h,
    tx: () => depArtifacts[1].left + depArtifacts[1].w / 2, ty: () => depArtifacts[1].top,
    label: 'HTTPS /auth/*' },
  { fromV: () => depArtifacts[1].viewGuid, toV: () => depArtifacts[2].viewGuid,
    fx: () => depArtifacts[1].left + depArtifacts[1].w, fy: () => depArtifacts[1].top + depArtifacts[1].h / 2,
    tx: () => depArtifacts[2].left, ty: () => depArtifacts[2].top + depArtifacts[2].h / 2,
    label: 'JDBC' },
  { fromV: () => depArtifacts[1].viewGuid, toV: () => depArtifacts[3].viewGuid,
    fx: () => depArtifacts[1].left + depArtifacts[1].w, fy: () => depArtifacts[1].top + depArtifacts[1].h / 2 + 20,
    tx: () => depArtifacts[3].left, ty: () => depArtifacts[3].top + depArtifacts[3].h / 2,
    label: 'TCP' },
];
for (const l of depLinks) { l.viewGuid = newGuid(); l.modelGuid = newGuid(); }

// ---------- sequence (UC-02 Вход) ----------
// lifelines (X — левый край, cx — центр)
const seqLifelines = [
  { name: 'Клиент',                 stereo: '<<actor>>',   left: 40,   w: 100 },
  { name: 'AuthController',         stereo: '<<boundary>>',left: 180,  w: 130 },
  { name: 'AuthService',            stereo: '<<control>>', left: 340,  w: 130 },
  { name: 'AuthenticationManager',  stereo: '<<control>>', left: 500,  w: 180 },
  { name: 'UserRepository',         stereo: '<<control>>', left: 720,  w: 130 },
  { name: 'JwtService',             stereo: '<<control>>', left: 880,  w: 110 },
  { name: 'RefreshTokenService',    stereo: '<<control>>', left: 1020, w: 180 },
  { name: 'PostgreSQL',             stereo: '<<entity>>',  left: 1230, w: 110 },
  { name: 'Redis',                  stereo: '<<entity>>',  left: 1380, w: 90 },
];
for (const ll of seqLifelines) {
  ll.modelGuid = newGuid(); ll.viewGuid = newGuid();
  ll.nameCompGuid = newGuid(); ll.nameLabelGuid = newGuid();
  ll.stereoLabelGuid = newGuid(); ll.propLabelGuid = newGuid();
  ll.lifeLineGuid = newGuid();
  ll.top = 120; ll.height = 1100;
  ll.cx = ll.left + ll.w / 2;
}
function L_(name) { return seqLifelines.find(l => l.name === name); }
// сообщения (от → к, текст). Y задаётся автоматически (шаг 50).
const seqRaw = [
  ['Клиент',                'AuthController',         '1: POST /auth/login'],
  ['AuthController',        'AuthService',            '2: login(request)'],
  ['AuthService',           'AuthenticationManager',  '3: authenticate(email, password)'],
  ['AuthenticationManager', 'UserRepository',         '4: findByEmail(email)'],
  ['UserRepository',        'PostgreSQL',             '5: SELECT user'],
  ['PostgreSQL',            'UserRepository',         '6: User (reply)'],
  ['UserRepository',        'AuthenticationManager',  '7: UserDetails (reply)'],
  ['AuthenticationManager', 'AuthService',            '8: OK (reply)'],
  ['AuthService',           'JwtService',             '9: generateAccessToken()'],
  ['JwtService',            'AuthService',            '10: accessToken (reply)'],
  ['AuthService',           'JwtService',             '11: generateRefreshToken()'],
  ['JwtService',            'AuthService',            '12: refreshToken (reply)'],
  ['AuthService',           'RefreshTokenService',    '13: revokeOldTokensByEmail()'],
  ['RefreshTokenService',   'Redis',                  '14: DEL старые ключи'],
  ['Redis',                 'RefreshTokenService',    '15: OK (reply)'],
  ['AuthService',           'RefreshTokenService',    '16: saveRefreshToken()'],
  ['RefreshTokenService',   'Redis',                  '17: SET TTL 7d'],
  ['AuthService',           'AuthController',         '18: AuthResponse (reply)'],
  ['AuthController',        'Клиент',                 '19: HTTP 200 (reply)'],
];
const seqMessages = seqRaw.map((m, i) => ({
  from: L_(m[0]), to: L_(m[1]), text: m[2],
  y: 220 + i * 48,
  modelGuid: newGuid(), viewGuid: newGuid(),
  nameLabel: newGuid(), stereoLabel: newGuid(), propLabel: newGuid(),
  activationGuid: newGuid(),
  actionGuid: newGuid(),
}));
// у каждого lifeline собираем список view-ссылок (для UMLObject.#Views)
for (const ll of seqLifelines) ll.viewRefs = [ll.viewGuid, ll.lifeLineGuid];

// ===================== генерация views =====================
function actorView(a) {
  w(`<XPD:OBJ name="OwnedViews[${a.idx}]" type="UMLActorView" guid="${a.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${a.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${a.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${a.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${a.h}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${a.modelGuid}</XPD:REF>`);
  nameCompartment(a.nameCompGuid, a.nameLabelGuid, a.stereoLabelGuid, a.propLabelGuid, a.name);
  w(`<XPD:OBJ name="AttributeCompartment" type="UMLAttributeCompartmentView" guid="${a.attrCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${a.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="OperationCompartment" type="UMLOperationCompartmentView" guid="${a.opCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${a.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

function ucView(uc) {
  w(`<XPD:OBJ name="OwnedViews[${uc.idx}]" type="UMLUseCaseView" guid="${uc.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${uc.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${uc.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${uc.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${uc.h}</XPD:ATTR>`);
  w(`<XPD:ATTR name="StereotypeDisplay" type="UMLStereotypeDisplayKind">sdkDecoration</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${uc.modelGuid}</XPD:REF>`);
  nameCompartment(uc.nameCompGuid, uc.nameLabelGuid, uc.stereoLabelGuid, uc.propLabelGuid, uc.name);
  w(`<XPD:OBJ name="AttributeCompartment" type="UMLAttributeCompartmentView" guid="${uc.attrCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${uc.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="OperationCompartment" type="UMLOperationCompartmentView" guid="${uc.opCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${uc.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="ExtensionPointCompartment" type="UMLExtensionPointCompartmentView" guid="${uc.extPointCompGuid}">`);
  w(`<XPD:REF name="Model">${uc.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// class view (interface рисуется тем же UMLClassView со стерео <<interface>>)
function classView(c) {
  w(`<XPD:OBJ name="OwnedViews[${c.idx}]" type="UMLClassView" guid="${c.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${c.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${c.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${c.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${c.h}</XPD:ATTR>`);
  w(`<XPD:ATTR name="StereotypeDisplay" type="UMLStereotypeDisplayKind">sdkDecoration</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  const stereo = c.isInterface ? '<<interface>>' : (c.stereo || null);
  nameCompartment(c.nameCompGuid, c.nameLabelGuid, c.stereoLabelGuid, c.propLabelGuid, c.name, stereo);
  // AttributeCompartment с атрибутами
  w(`<XPD:OBJ name="AttributeCompartment" type="UMLAttributeCompartmentView" guid="${c.attrCompGuid}">`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  if (c.attrs.length > 0) {
    w(`<XPD:ATTR name="#OwnedViews" type="integer">${c.attrs.length}</XPD:ATTR>`);
    c.attrs.forEach((t, i) => {
      w(`<XPD:OBJ name="OwnedViews[${i}]" type="UMLAttributeView" guid="${c.attrGuids[i]}">`);
      w(`<XPD:OBJ name="NameLabel" type="LabelView" guid="${c.attrLabelGuids[i]}">`);
      w(`<XPD:ATTR name="Text" type="string">${escapeXml(t)}</XPD:ATTR>`);
      w(`</XPD:OBJ>`);
      w(`</XPD:OBJ>`);
    });
  }
  w(`</XPD:OBJ>`);
  // OperationCompartment с операциями
  w(`<XPD:OBJ name="OperationCompartment" type="UMLOperationCompartmentView" guid="${c.opCompGuid}">`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  if (c.ops.length > 0) {
    w(`<XPD:ATTR name="#OwnedViews" type="integer">${c.ops.length}</XPD:ATTR>`);
    c.ops.forEach((t, i) => {
      w(`<XPD:OBJ name="OwnedViews[${i}]" type="UMLOperationView" guid="${c.opGuids[i]}">`);
      w(`<XPD:OBJ name="NameLabel" type="LabelView" guid="${c.opLabelGuids[i]}">`);
      w(`<XPD:ATTR name="Text" type="string">${escapeXml(t)}</XPD:ATTR>`);
      w(`</XPD:OBJ>`);
      w(`</XPD:OBJ>`);
    });
  }
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="TemplateParameterCompartment" type="UMLTemplateParameterCompartmentView" guid="${c.tplCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

function componentView(c) {
  w(`<XPD:OBJ name="OwnedViews[${c.idx}]" type="UMLComponentView" guid="${c.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${c.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${c.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${c.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${c.h}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  nameCompartment(c.nameCompGuid, c.nameLabelGuid, c.stereoLabelGuid, c.propLabelGuid, c.name, '<<component>>');
  w(`<XPD:OBJ name="ResidentCompartment" type="UMLResidentCompartmentView" guid="${c.residentCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${c.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// "БД" в component-диаграмме рисуем как класс со стерео <<database>>
function dbAsClassView(d) {
  w(`<XPD:OBJ name="OwnedViews[${d.idx}]" type="UMLClassView" guid="${d.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${d.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${d.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${d.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${d.h}</XPD:ATTR>`);
  w(`<XPD:ATTR name="StereotypeDisplay" type="UMLStereotypeDisplayKind">sdkDecoration</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${d.modelGuid}</XPD:REF>`);
  nameCompartment(d.nameCompGuid, d.nameLabelGuid, d.stereoLabelGuid, d.propLabelGuid, d.name, '<<database>>');
  w(`<XPD:OBJ name="AttributeCompartment" type="UMLAttributeCompartmentView" guid="${d.attrCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${d.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="OperationCompartment" type="UMLOperationCompartmentView" guid="${d.opCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${d.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="TemplateParameterCompartment" type="UMLTemplateParameterCompartmentView" guid="${d.tplCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${d.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

function nodeView(n) {
  w(`<XPD:OBJ name="OwnedViews[${n.idx}]" type="UMLNodeView" guid="${n.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${n.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${n.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${n.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${n.h}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${n.modelGuid}</XPD:REF>`);
  nameCompartment(n.nameCompGuid, n.nameLabelGuid, n.stereoLabelGuid, n.propLabelGuid, n.name);
  w(`<XPD:OBJ name="DeployedComponentCompartment" type="UMLDeployedComponentCompartmentView" guid="${n.deployCompGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${n.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="DeployedArtifactCompartment" type="UMLDeployedArtifactCompartmentView" guid="${n.deployArtGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${n.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// ===== views для sequence =====
function seqLifelineView(ll) {
  w(`<XPD:OBJ name="OwnedViews[${ll.idx}]" type="UMLSeqObjectView" guid="${ll.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${ll.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${ll.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${ll.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${ll.height}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${ll.modelGuid}</XPD:REF>`);
  w(`<XPD:OBJ name="NameCompartment" type="UMLNameCompartmentView" guid="${ll.nameCompGuid}">`);
  w(`<XPD:OBJ name="NameLabel" type="LabelView" guid="${ll.nameLabelGuid}">`);
  w(`<XPD:ATTR name="FontStyle" type="integer">4</XPD:ATTR>`);
  w(`<XPD:ATTR name="Text" type="string">${escapeXml(ll.name)}</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="StereotypeLabel" type="LabelView" guid="${ll.stereoLabelGuid}">`);
  w(`<XPD:ATTR name="Text" type="string">${escapeXml(ll.stereo)}</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="PropertyLabel" type="LabelView" guid="${ll.propLabelGuid}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="LifeLine" type="UMLLifeLineView" guid="${ll.lifeLineGuid}">`);
  w(`<XPD:REF name="Model">${ll.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

function seqStimulusView(m) {
  const x1 = m.from.cx, x2 = m.to.cx;
  w(`<XPD:OBJ name="OwnedViews[${m.idx}]" type="UMLSeqStimulusView" guid="${m.viewGuid}">`);
  w(`<XPD:ATTR name="LineStyle" type="LineStyleKind">lsRectilinear</XPD:ATTR>`);
  w(`<XPD:ATTR name="Points" type="Points">${x1},${m.y};${x2},${m.y}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${m.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Head">${m.to.viewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Tail">${m.from.viewGuid}</XPD:REF>`);
  w(`<XPD:OBJ name="NameLabel" type="EdgeLabelView" guid="${m.nameLabel}">`);
  w(`<XPD:ATTR name="Alpha" type="real">1,5707963267949</XPD:ATTR>`);
  w(`<XPD:ATTR name="Distance" type="real">10</XPD:ATTR>`);
  w(`<XPD:ATTR name="Text" type="string">${escapeXml(m.text)}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${m.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="HostEdge">${m.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="StereotypeLabel" type="EdgeLabelView" guid="${m.stereoLabel}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:ATTR name="Alpha" type="real">1,5707963267949</XPD:ATTR>`);
  w(`<XPD:ATTR name="Distance" type="real">25</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${m.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="HostEdge">${m.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="PropertyLabel" type="EdgeLabelView" guid="${m.propLabel}">`);
  w(`<XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:ATTR name="Alpha" type="real">-1,5707963267949</XPD:ATTR>`);
  w(`<XPD:ATTR name="Distance" type="real">10</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${m.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="HostEdge">${m.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  // активация на receiver-стороне
  w(`<XPD:OBJ name="Activation" type="UMLActivationView" guid="${m.activationGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${Math.round(x2 - 7)}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${m.y}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">14</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">29</XPD:ATTR>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// артефакт в deployment-диаграмме (упрощённо: рисуем как UMLClassView со стерео <<artifact>>)
function artifactAsClassView(a) {
  w(`<XPD:OBJ name="OwnedViews[${a.idx}]" type="UMLClassView" guid="${a.viewGuid}">`);
  w(`<XPD:ATTR name="Left" type="integer">${a.left}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Top" type="integer">${a.top}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Width" type="integer">${a.w}</XPD:ATTR>`);
  w(`<XPD:ATTR name="Height" type="integer">${a.h}</XPD:ATTR>`);
  w(`<XPD:ATTR name="StereotypeDisplay" type="UMLStereotypeDisplayKind">sdkDecoration</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${a.modelGuid}</XPD:REF>`);
  nameCompartment(a.nameCompGuid, a.nameLabelGuid, a.stereoLabelGuid, a.propLabelGuid, a.name, '<<artifact>>');
  const ac = newGuid(), oc = newGuid(), tc = newGuid();
  w(`<XPD:OBJ name="AttributeCompartment" type="UMLAttributeCompartmentView" guid="${ac}"><XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR><XPD:REF name="Model">${a.modelGuid}</XPD:REF></XPD:OBJ>`);
  w(`<XPD:OBJ name="OperationCompartment" type="UMLOperationCompartmentView" guid="${oc}"><XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR><XPD:REF name="Model">${a.modelGuid}</XPD:REF></XPD:OBJ>`);
  w(`<XPD:OBJ name="TemplateParameterCompartment" type="UMLTemplateParameterCompartmentView" guid="${tc}"><XPD:ATTR name="Visible" type="boolean">False</XPD:ATTR><XPD:REF name="Model">${a.modelGuid}</XPD:REF></XPD:OBJ>`);
  w(`</XPD:OBJ>`);
}

// ===================== строим XML =====================
w(`<?xml version="1.0" encoding="UTF-8"?>`);
w(`<XPD:PROJECT xmlns:XPD="http://www.staruml.com" version="1">`);
w(`<XPD:HEADER>`);
w(`<XPD:SUBUNITS>`);
w(`</XPD:SUBUNITS>`);
w(`<XPD:PROFILES>`);
w(`<XPD:PROFILE>UMLStandard</XPD:PROFILE>`);
w(`</XPD:PROFILES>`);
w(`</XPD:HEADER>`);
w(`<XPD:BODY>`);
w(`<XPD:OBJ name="DocumentElement" type="UMLProject" guid="${G.project}">`);
w(`<XPD:ATTR name="Title" type="string">auth-service</XPD:ATTR>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">4</XPD:ATTR>`);

// ============ MODEL[0] = Use Case View ============
w(`<XPD:OBJ name="OwnedElements[0]" type="UMLModel" guid="${G.ucModel}">`);
w(`<XPD:ATTR name="Name" type="string">Use Case View</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.project}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">1</XPD:ATTR>`);

w(`<XPD:OBJ name="OwnedElements[0]" type="UMLPackage" guid="${G.pkgUCMain}">`);
w(`<XPD:ATTR name="Name" type="string">Main</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.ucModel}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedDiagrams" type="integer">1</XPD:ATTR>`);

w(`<XPD:OBJ name="OwnedDiagrams[0]" type="UMLUseCaseDiagram" guid="${G.ucDiagram}">`);
w(`<XPD:ATTR name="Name" type="string">01 Use Case — auth-service</XPD:ATTR>`);
w(`<XPD:REF name="DiagramOwner">${G.pkgUCMain}</XPD:REF>`);

w(`<XPD:OBJ name="DiagramView" type="UMLUseCaseDiagramView" guid="${G.ucDiagramView}">`);
w(`<XPD:REF name="Diagram">${G.ucDiagram}</XPD:REF>`);
const ucViews = ucActors.length + ucUseCases.length + ucAssociations.length;
w(`<XPD:ATTR name="#OwnedViews" type="integer">${ucViews}</XPD:ATTR>`);
let idx = 0;
for (const a of ucActors) { a.idx = idx++; actorView(a); }
for (const uc of ucUseCases) { uc.idx = idx++; ucView(uc); }
for (const a of ucAssociations) {
  a.idx = idx++;
  const ax = a.actor.left + a.actor.w, ay = a.actor.top + a.actor.h / 2;
  const ux = a.uc.left, uy = a.uc.top + a.uc.h / 2;
  w(`<XPD:OBJ name="OwnedViews[${a.idx}]" type="UMLAssociationView" guid="${a.viewGuid}">`);
  w(`<XPD:ATTR name="LineStyle" type="LineStyleKind">lsRectilinear</XPD:ATTR>`);
  w(`<XPD:ATTR name="Points" type="Points">${ax},${ay};${ux},${uy}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${a.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Head">${a.uc.viewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Tail">${a.actor.viewGuid}</XPD:REF>`);
  edgeLabel('NameLabel', newGuid(), a.modelGuid, '1,5707963267949', '15');
  edgeLabel('StereotypeLabel', newGuid(), a.modelGuid, '1,5707963267949', '30');
  edgeLabel('PropertyLabel', newGuid(), a.modelGuid, '-1,5707963267949', '15');
  edgeLabel('HeadRoleNameLabel', newGuid(), a.end2Guid, '-0,523598775598299', '30', 'epHead');
  edgeLabel('TailRoleNameLabel', newGuid(), a.end1Guid, '0,523598775598299', '30', 'epTail');
  edgeLabel('HeadMultiplicityLabel', newGuid(), a.end2Guid, '0,523598775598299', '25', 'epHead');
  edgeLabel('TailMultiplicityLabel', newGuid(), a.end1Guid, '-0,523598775598299', '25', 'epTail');
  edgeLabel('HeadPropertyLabel', newGuid(), a.end2Guid, '-0,785398163397448', '40', 'epHead');
  edgeLabel('TailPropertyLabel', newGuid(), a.end1Guid, '0,785398163397448', '40', 'epTail');
  qualifierComp('HeadQualifierCompartment', newGuid(), a.end2Guid);
  qualifierComp('TailQualifierCompartment', newGuid(), a.end1Guid);
  w(`</XPD:OBJ>`);
}
w(`</XPD:OBJ>`); // DiagramView
w(`</XPD:OBJ>`); // Diagram

// модели UC
const ucOwnedCount = 2 + ucAssociations.length;
w(`<XPD:ATTR name="#OwnedElements" type="integer">${ucOwnedCount}</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedElements[0]" type="UMLPackage" guid="${G.pkgActors}">`);
w(`<XPD:ATTR name="Name" type="string">Actors</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.pkgUCMain}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">${ucActors.length}</XPD:ATTR>`);
ucActors.forEach((a, i) => {
  w(`<XPD:OBJ name="OwnedElements[${i}]" type="UMLActor" guid="${a.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(a.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgActors}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${a.viewRefs.length}</XPD:ATTR>`);
  a.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  if (a.associations.length > 0) {
    w(`<XPD:ATTR name="#Associations" type="integer">${a.associations.length}</XPD:ATTR>`);
    a.associations.forEach((g, j) => w(`<XPD:REF name="Associations[${j}]">${g}</XPD:REF>`));
  }
  w(`</XPD:OBJ>`);
});
w(`</XPD:OBJ>`);
w(`<XPD:OBJ name="OwnedElements[1]" type="UMLPackage" guid="${G.pkgUseCases}">`);
w(`<XPD:ATTR name="Name" type="string">Use Cases</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.pkgUCMain}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">${ucUseCases.length}</XPD:ATTR>`);
ucUseCases.forEach((uc, i) => {
  w(`<XPD:OBJ name="OwnedElements[${i}]" type="UMLUseCase" guid="${uc.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(uc.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgUseCases}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${uc.viewRefs.length}</XPD:ATTR>`);
  uc.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  const aa = ucAssociations.filter(a => a.uc === uc).map(a => a.end2Guid);
  if (aa.length > 0) {
    w(`<XPD:ATTR name="#Associations" type="integer">${aa.length}</XPD:ATTR>`);
    aa.forEach((g, j) => w(`<XPD:REF name="Associations[${j}]">${g}</XPD:REF>`));
  }
  w(`</XPD:OBJ>`);
});
w(`</XPD:OBJ>`);
ucAssociations.forEach((a, i) => {
  w(`<XPD:OBJ name="OwnedElements[${i + 2}]" type="UMLAssociation" guid="${a.modelGuid}">`);
  w(`<XPD:REF name="Namespace">${G.pkgUCMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${a.viewGuid}</XPD:REF>`);
  w(`<XPD:ATTR name="#Connections" type="integer">2</XPD:ATTR>`);
  w(`<XPD:OBJ name="Connections[0]" type="UMLAssociationEnd" guid="${a.end1Guid}">`);
  w(`<XPD:ATTR name="IsNavigable" type="boolean">False</XPD:ATTR>`);
  w(`<XPD:REF name="Association">${a.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Participant">${a.actor.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:OBJ name="Connections[1]" type="UMLAssociationEnd" guid="${a.end2Guid}">`);
  w(`<XPD:REF name="Association">${a.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Participant">${a.uc.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`</XPD:OBJ>`);
});
w(`</XPD:OBJ>`); // pkgUCMain
w(`</XPD:OBJ>`); // ucModel

// ============ MODEL[1] = Logical View (class) ============
w(`<XPD:OBJ name="OwnedElements[1]" type="UMLModel" guid="${G.logicalModel}">`);
w(`<XPD:ATTR name="Name" type="string">Logical View</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.project}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedElements[0]" type="UMLPackage" guid="${G.pkgClassMain}">`);
w(`<XPD:ATTR name="Name" type="string">Main</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.logicalModel}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedDiagrams" type="integer">1</XPD:ATTR>`);

w(`<XPD:OBJ name="OwnedDiagrams[0]" type="UMLClassDiagram" guid="${G.clsDiagram}">`);
w(`<XPD:ATTR name="Name" type="string">02 Class — auth-service</XPD:ATTR>`);
w(`<XPD:REF name="DiagramOwner">${G.pkgClassMain}</XPD:REF>`);
w(`<XPD:OBJ name="DiagramView" type="UMLClassDiagramView" guid="${G.clsDiagramView}">`);
w(`<XPD:REF name="Diagram">${G.clsDiagram}</XPD:REF>`);
const clsViewsCount = classes.length + classRels.length;
w(`<XPD:ATTR name="#OwnedViews" type="integer">${clsViewsCount}</XPD:ATTR>`);
idx = 0;
for (const c of classes) { c.idx = idx++; classView(c); }
for (const r of classRels) {
  r.idx = idx++;
  const fc = r.fromC, tc = r.toC;
  const x1 = fc.left + fc.w, y1 = fc.top + fc.h / 2;
  const x2 = tc.left,        y2 = tc.top + tc.h / 2;
  if (r.kind === 'assoc') {
    w(`<XPD:OBJ name="OwnedViews[${r.idx}]" type="UMLAssociationView" guid="${r.viewGuid}">`);
  } else {
    w(`<XPD:OBJ name="OwnedViews[${r.idx}]" type="UMLDependencyView" guid="${r.viewGuid}">`);
  }
  w(`<XPD:ATTR name="LineStyle" type="LineStyleKind">lsRectilinear</XPD:ATTR>`);
  w(`<XPD:ATTR name="Points" type="Points">${x1},${y1};${x2},${y2}</XPD:ATTR>`);
  w(`<XPD:REF name="Model">${r.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Head">${tc.viewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Tail">${fc.viewGuid}</XPD:REF>`);
  edgeLabel('NameLabel', newGuid(), r.modelGuid, '1,5707963267949', '15');
  edgeLabel('StereotypeLabel', newGuid(), r.modelGuid, '1,5707963267949', '30');
  edgeLabel('PropertyLabel', newGuid(), r.modelGuid, '-1,5707963267949', '15');
  if (r.kind === 'assoc') {
    edgeLabel('HeadRoleNameLabel', newGuid(), r.end2Guid, '-0,523598775598299', '30', 'epHead');
    edgeLabel('TailRoleNameLabel', newGuid(), r.end1Guid, '0,523598775598299', '30', 'epTail');
    edgeLabel('HeadMultiplicityLabel', newGuid(), r.end2Guid, '0,523598775598299', '25', 'epHead');
    edgeLabel('TailMultiplicityLabel', newGuid(), r.end1Guid, '-0,523598775598299', '25', 'epTail');
    edgeLabel('HeadPropertyLabel', newGuid(), r.end2Guid, '-0,785398163397448', '40', 'epHead');
    edgeLabel('TailPropertyLabel', newGuid(), r.end1Guid, '0,785398163397448', '40', 'epTail');
    qualifierComp('HeadQualifierCompartment', newGuid(), r.end2Guid);
    qualifierComp('TailQualifierCompartment', newGuid(), r.end1Guid);
  }
  w(`</XPD:OBJ>`);
}
w(`</XPD:OBJ>`); // DiagramView
w(`</XPD:OBJ>`); // Diagram

// модели классов
const clsOwnedCount = classes.length + classRels.length;
w(`<XPD:ATTR name="#OwnedElements" type="integer">${clsOwnedCount}</XPD:ATTR>`);
classes.forEach((c, i) => {
  const type = c.isInterface ? 'UMLInterface' : 'UMLClass';
  w(`<XPD:OBJ name="OwnedElements[${i}]" type="${type}" guid="${c.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(c.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgClassMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${c.viewRefs.length}</XPD:ATTR>`);
  c.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  if (c.assocs && c.assocs.length > 0) {
    w(`<XPD:ATTR name="#Associations" type="integer">${c.assocs.length}</XPD:ATTR>`);
    c.assocs.forEach((g, j) => w(`<XPD:REF name="Associations[${j}]">${g}</XPD:REF>`));
  }
  // атрибуты-модели (UMLAttribute)
  if (c.attrs.length > 0) {
    w(`<XPD:ATTR name="#Attributes" type="integer">${c.attrs.length}</XPD:ATTR>`);
    c.attrs.forEach((t, k) => {
      w(`<XPD:OBJ name="Attributes[${k}]" type="UMLAttribute" guid="${newGuid()}">`);
      w(`<XPD:ATTR name="Name" type="string">${escapeXml(t)}</XPD:ATTR>`);
      w(`<XPD:REF name="Owner">${c.modelGuid}</XPD:REF>`);
      w(`</XPD:OBJ>`);
    });
  }
  // операции-модели (UMLOperation)
  if (c.ops.length > 0) {
    w(`<XPD:ATTR name="#Operations" type="integer">${c.ops.length}</XPD:ATTR>`);
    c.ops.forEach((t, k) => {
      w(`<XPD:OBJ name="Operations[${k}]" type="UMLOperation" guid="${newGuid()}">`);
      w(`<XPD:ATTR name="Name" type="string">${escapeXml(t)}</XPD:ATTR>`);
      w(`<XPD:REF name="Owner">${c.modelGuid}</XPD:REF>`);
      w(`</XPD:OBJ>`);
    });
  }
  w(`</XPD:OBJ>`);
});
classRels.forEach((r, i) => {
  if (r.kind === 'assoc') {
    w(`<XPD:OBJ name="OwnedElements[${classes.length + i}]" type="UMLAssociation" guid="${r.modelGuid}">`);
    w(`<XPD:REF name="Namespace">${G.pkgClassMain}</XPD:REF>`);
    w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
    w(`<XPD:REF name="Views[0]">${r.viewGuid}</XPD:REF>`);
    w(`<XPD:ATTR name="#Connections" type="integer">2</XPD:ATTR>`);
    w(`<XPD:OBJ name="Connections[0]" type="UMLAssociationEnd" guid="${r.end1Guid}">`);
    w(`<XPD:ATTR name="IsNavigable" type="boolean">False</XPD:ATTR>`);
    w(`<XPD:REF name="Association">${r.modelGuid}</XPD:REF>`);
    w(`<XPD:REF name="Participant">${r.fromC.modelGuid}</XPD:REF>`);
    w(`</XPD:OBJ>`);
    w(`<XPD:OBJ name="Connections[1]" type="UMLAssociationEnd" guid="${r.end2Guid}">`);
    w(`<XPD:REF name="Association">${r.modelGuid}</XPD:REF>`);
    w(`<XPD:REF name="Participant">${r.toC.modelGuid}</XPD:REF>`);
    w(`</XPD:OBJ>`);
    w(`</XPD:OBJ>`);
  } else {
    w(`<XPD:OBJ name="OwnedElements[${classes.length + i}]" type="UMLDependency" guid="${r.modelGuid}">`);
    w(`<XPD:REF name="Namespace">${G.pkgClassMain}</XPD:REF>`);
    w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
    w(`<XPD:REF name="Views[0]">${r.viewGuid}</XPD:REF>`);
    w(`<XPD:REF name="Client">${r.fromC.modelGuid}</XPD:REF>`);
    w(`<XPD:REF name="Supplier">${r.toC.modelGuid}</XPD:REF>`);
    w(`</XPD:OBJ>`);
  }
});
w(`</XPD:OBJ>`); // pkgClassMain

// ===== sequence (UMLCollaborationInstanceSet внутри Logical View) =====
w(`<XPD:ATTR name="#OwnedCollaborationInstanceSets" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedCollaborationInstanceSets[0]" type="UMLCollaborationInstanceSet" guid="${G.collabSet}">`);
w(`<XPD:ATTR name="Name" type="string">UC-02 Login Interaction</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.logicalModel}</XPD:REF>`);
w(`<XPD:ATTR name="#InteractionInstanceSets" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="InteractionInstanceSets[0]" type="UMLInteractionInstanceSet" guid="${G.interactionSet}">`);
w(`<XPD:ATTR name="Name" type="string">UC-02 Login</XPD:ATTR>`);
w(`<XPD:REF name="Context">${G.collabSet}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedDiagrams" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedDiagrams[0]" type="UMLSequenceDiagram" guid="${G.seqDiagram}">`);
w(`<XPD:ATTR name="Name" type="string">05 Sequence — UC-02 Вход</XPD:ATTR>`);
w(`<XPD:REF name="DiagramOwner">${G.interactionSet}</XPD:REF>`);
w(`<XPD:OBJ name="DiagramView" type="UMLSequenceDiagramView" guid="${G.seqDiagramView}">`);
w(`<XPD:REF name="Diagram">${G.seqDiagram}</XPD:REF>`);
const seqViewsCount = seqLifelines.length + seqMessages.length;
w(`<XPD:ATTR name="#OwnedViews" type="integer">${seqViewsCount}</XPD:ATTR>`);
idx = 0;
for (const ll of seqLifelines) { ll.idx = idx++; seqLifelineView(ll); }
for (const m of seqMessages)   { m.idx  = idx++; seqStimulusView(m); }
w(`</XPD:OBJ>`); // DiagramView
w(`</XPD:OBJ>`); // SequenceDiagram

// модели стимулов (UMLStimulus)
w(`<XPD:ATTR name="#ParticipatingStimuli" type="integer">${seqMessages.length}</XPD:ATTR>`);
seqMessages.forEach((m, i) => {
  w(`<XPD:OBJ name="ParticipatingStimuli[${i}]" type="UMLStimulus" guid="${m.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(m.text)}</XPD:ATTR>`);
  w(`<XPD:REF name="Sender">${m.from.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Receiver">${m.to.modelGuid}</XPD:REF>`);
  w(`<XPD:OBJ name="Action" type="UMLCallAction" guid="${m.actionGuid}">`);
  w(`<XPD:REF name="Stimulus">${m.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
  w(`<XPD:REF name="InteractionInstanceSet">${G.interactionSet}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${m.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
});

w(`</XPD:OBJ>`); // InteractionInstanceSet

// модели lifelines (UMLObject)
w(`<XPD:ATTR name="#ParticipatingInstances" type="integer">${seqLifelines.length}</XPD:ATTR>`);
seqLifelines.forEach((ll, i) => {
  w(`<XPD:OBJ name="ParticipatingInstances[${i}]" type="UMLObject" guid="${ll.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(ll.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="CollaborationInstanceSet">${G.collabSet}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${ll.viewRefs.length}</XPD:ATTR>`);
  ll.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  w(`</XPD:OBJ>`);
});

w(`</XPD:OBJ>`); // CollaborationInstanceSet

w(`</XPD:OBJ>`); // logicalModel

// ============ MODEL[2] = Component View ============
w(`<XPD:OBJ name="OwnedElements[2]" type="UMLModel" guid="${G.componentModel}">`);
w(`<XPD:ATTR name="Name" type="string">Component View</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.project}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedElements[0]" type="UMLPackage" guid="${G.pkgCompMain}">`);
w(`<XPD:ATTR name="Name" type="string">Main</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.componentModel}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedDiagrams" type="integer">1</XPD:ATTR>`);

w(`<XPD:OBJ name="OwnedDiagrams[0]" type="UMLComponentDiagram" guid="${G.cmpDiagram}">`);
w(`<XPD:ATTR name="Name" type="string">03 Component — auth-service</XPD:ATTR>`);
w(`<XPD:REF name="DiagramOwner">${G.pkgCompMain}</XPD:REF>`);
w(`<XPD:OBJ name="DiagramView" type="UMLComponentDiagramView" guid="${G.cmpDiagramView}">`);
w(`<XPD:REF name="Diagram">${G.cmpDiagram}</XPD:REF>`);
const cmpViewsCount = components.length + dbNodes.length + cmpDeps.length + cmpToDb.length;
w(`<XPD:ATTR name="#OwnedViews" type="integer">${cmpViewsCount}</XPD:ATTR>`);
idx = 0;
for (const c of components) { c.idx = idx++; componentView(c); }
for (const d of dbNodes)    { d.idx = idx++; dbAsClassView(d); }
// связи компонент↔компонент
for (const r of cmpDeps) {
  const fc = r.fromC, tc = r.toC;
  const x1 = fc.left + fc.w / 2, y1 = fc.top + fc.h;
  const x2 = tc.left + tc.w / 2, y2 = tc.top;
  fullDependencyView(idx++, r.viewGuid, tc.viewGuid, fc.viewGuid, r.modelGuid, x1, y1, x2, y2);
}
// компонент → БД
for (const r of cmpToDb) {
  const fc = r.fromC, td = r.to;
  const x1 = fc.left + fc.w / 2, y1 = fc.top + fc.h;
  const x2 = td.left + td.w / 2, y2 = td.top;
  fullDependencyView(idx++, r.viewGuid, td.viewGuid, fc.viewGuid, r.modelGuid, x1, y1, x2, y2, r.label);
}
w(`</XPD:OBJ>`); // DiagramView
w(`</XPD:OBJ>`); // Diagram

// модели компонентов и зависимостей
const cmpOwnedCount = components.length + dbNodes.length + cmpDeps.length + cmpToDb.length;
w(`<XPD:ATTR name="#OwnedElements" type="integer">${cmpOwnedCount}</XPD:ATTR>`);
components.forEach((c, i) => {
  w(`<XPD:OBJ name="OwnedElements[${i}]" type="UMLComponent" guid="${c.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(c.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgCompMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${c.viewRefs.length}</XPD:ATTR>`);
  c.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  w(`</XPD:OBJ>`);
});
dbNodes.forEach((d, i) => {
  w(`<XPD:OBJ name="OwnedElements[${components.length + i}]" type="UMLClass" guid="${d.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(d.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgCompMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${d.viewRefs.length}</XPD:ATTR>`);
  d.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  w(`</XPD:OBJ>`);
});
let depBase = components.length + dbNodes.length;
cmpDeps.forEach((r, i) => {
  w(`<XPD:OBJ name="OwnedElements[${depBase + i}]" type="UMLDependency" guid="${r.modelGuid}">`);
  w(`<XPD:REF name="Namespace">${G.pkgCompMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${r.viewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Client">${r.fromC.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Supplier">${r.toC.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
});
depBase += cmpDeps.length;
cmpToDb.forEach((r, i) => {
  w(`<XPD:OBJ name="OwnedElements[${depBase + i}]" type="UMLDependency" guid="${r.modelGuid}">`);
  w(`<XPD:REF name="Namespace">${G.pkgCompMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${r.viewGuid}</XPD:REF>`);
  w(`<XPD:REF name="Client">${r.fromC.modelGuid}</XPD:REF>`);
  w(`<XPD:REF name="Supplier">${r.to.modelGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
});

w(`</XPD:OBJ>`); // pkgCompMain
w(`</XPD:OBJ>`); // componentModel

// ============ MODEL[3] = Deployment View ============
w(`<XPD:OBJ name="OwnedElements[3]" type="UMLModel" guid="${G.deploymentModel}">`);
w(`<XPD:ATTR name="Name" type="string">Deployment View</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.project}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedElements" type="integer">1</XPD:ATTR>`);
w(`<XPD:OBJ name="OwnedElements[0]" type="UMLPackage" guid="${G.pkgDeployMain}">`);
w(`<XPD:ATTR name="Name" type="string">Main</XPD:ATTR>`);
w(`<XPD:REF name="Namespace">${G.deploymentModel}</XPD:REF>`);
w(`<XPD:ATTR name="#OwnedDiagrams" type="integer">1</XPD:ATTR>`);

w(`<XPD:OBJ name="OwnedDiagrams[0]" type="UMLDeploymentDiagram" guid="${G.depDiagram}">`);
w(`<XPD:ATTR name="Name" type="string">04 Deployment — auth-service</XPD:ATTR>`);
w(`<XPD:REF name="DiagramOwner">${G.pkgDeployMain}</XPD:REF>`);
w(`<XPD:OBJ name="DiagramView" type="UMLDeploymentDiagramView" guid="${G.depDiagramView}">`);
w(`<XPD:REF name="Diagram">${G.depDiagram}</XPD:REF>`);
const depViewsCount = depNodes.length + depArtifacts.length + depLinks.length;
w(`<XPD:ATTR name="#OwnedViews" type="integer">${depViewsCount}</XPD:ATTR>`);
idx = 0;
for (const n of depNodes) { n.idx = idx++; nodeView(n); }
for (const a of depArtifacts) { a.idx = idx++; artifactAsClassView(a); }
for (const l of depLinks) {
  const id = idx++;
  fullDependencyView(id, l.viewGuid, l.toV(), l.fromV(), l.modelGuid, l.fx(), l.fy(), l.tx(), l.ty(), l.label);
}
w(`</XPD:OBJ>`); // DiagramView
w(`</XPD:OBJ>`); // Diagram

// модели deployment
const depOwnedCount = depNodes.length + depArtifacts.length + depLinks.length;
w(`<XPD:ATTR name="#OwnedElements" type="integer">${depOwnedCount}</XPD:ATTR>`);
depNodes.forEach((n, i) => {
  w(`<XPD:OBJ name="OwnedElements[${i}]" type="UMLNode" guid="${n.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(n.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgDeployMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">${n.viewRefs.length}</XPD:ATTR>`);
  n.viewRefs.forEach((v, j) => w(`<XPD:REF name="Views[${j}]">${v}</XPD:REF>`));
  w(`</XPD:OBJ>`);
});
depArtifacts.forEach((a, i) => {
  w(`<XPD:OBJ name="OwnedElements[${depNodes.length + i}]" type="UMLClass" guid="${a.modelGuid}">`);
  w(`<XPD:ATTR name="Name" type="string">${escapeXml(a.name)}</XPD:ATTR>`);
  w(`<XPD:REF name="Namespace">${G.pkgDeployMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${a.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
});
depLinks.forEach((l, i) => {
  w(`<XPD:OBJ name="OwnedElements[${depNodes.length + depArtifacts.length + i}]" type="UMLDependency" guid="${l.modelGuid}">`);
  w(`<XPD:REF name="Namespace">${G.pkgDeployMain}</XPD:REF>`);
  w(`<XPD:ATTR name="#Views" type="integer">1</XPD:ATTR>`);
  w(`<XPD:REF name="Views[0]">${l.viewGuid}</XPD:REF>`);
  w(`</XPD:OBJ>`);
});

w(`</XPD:OBJ>`); // pkgDeployMain
w(`</XPD:OBJ>`); // deploymentModel

w(`</XPD:OBJ>`); // UMLProject
w(`</XPD:BODY>`);
w(`</XPD:PROJECT>`);

// ===================== запись =====================
const outDir = path.join(__dirname, '..', 'staruml');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'auth-service.uml');
fs.writeFileSync(outFile, L.join('\n'), 'utf8');
console.log('Сгенерирован:', outFile);
console.log('Строк:', L.length);
console.log('Размер:', fs.statSync(outFile).size, 'байт');
