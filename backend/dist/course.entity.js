"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = exports.CourseType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const jsonTransformer = {
    to: (value) => {
        if (!value || value.length === 0)
            return null;
        return JSON.stringify(value);
    },
    from: (value) => {
        if (!value)
            return [];
        try {
            return JSON.parse(value);
        }
        catch {
            return [];
        }
    },
};
var CourseType;
(function (CourseType) {
    CourseType["UNI_CORE"] = "uni_core";
    CourseType["FACULTY_CORE"] = "faculty_core";
    CourseType["CS_CORE"] = "cs_core";
    CourseType["STREAM"] = "stream";
    CourseType["ELECTIVE"] = "elective";
})(CourseType || (exports.CourseType = CourseType = {}));
let Course = class Course {
    id;
    name;
    nameId;
    credits;
    type;
    semester;
    x;
    y;
    topics;
    references;
    user;
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Course.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name_id' }),
    __metadata("design:type", String)
], Course.prototype, "nameId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Course.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: CourseType,
    }),
    __metadata("design:type", String)
], Course.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Course.prototype, "semester", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Course.prototype, "x", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Course.prototype, "y", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, transformer: jsonTransformer }),
    __metadata("design:type", Array)
], Course.prototype, "topics", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true, transformer: jsonTransformer }),
    __metadata("design:type", Array)
], Course.prototype, "references", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.courses),
    __metadata("design:type", user_entity_1.User)
], Course.prototype, "user", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)()
], Course);
//# sourceMappingURL=course.entity.js.map